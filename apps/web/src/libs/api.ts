import axios, { AxiosError } from 'axios';

import { env } from '~/libs/env';
import { jsonToCamelCase, jsonToSnakeCase } from '~/libs/utils';

/**
 * Instância única de HTTP do projeto. TODA chamada à API passa por aqui,
 * sempre através de uma função em `~/services/*`.
 *
 * Responsabilidades:
 * - Autenticação por cookie httpOnly (`withCredentials`), sem token em JS.
 * - Tradução do contrato: `camelCase` no front, `snake_case` no backend.
 * - Sessão expirada na área da unidade (401) → volta para o login.
 * - Normalização de qualquer falha em `Error` com mensagem exibível ao usuário.
 */
const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const DEFAULT_ERROR_MESSAGE = 'Algo deu errado';

/**
 * FormData, Blob, ArrayBuffer e URLSearchParams precisam chegar intactos ao
 * backend — converter suas chaves destruiria o corpo da requisição.
 */
function isConvertibleBody(data: unknown): boolean {
  if (data === null || typeof data !== 'object') return false;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return false;
  if (typeof Blob !== 'undefined' && data instanceof Blob) return false;
  if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
    return false;
  }
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) return false;

  return true;
}

api.interceptors.request.use((config) => {
  // Corpo: conversão profunda, porque objetos aninhados também vão para o banco.
  if (isConvertibleBody(config.data)) {
    config.data = jsonToSnakeCase(config.data);
  }

  // Query string: conversão rasa — os valores são escalares ou arrays de
  // escalares e não devem ser tocados, só os nomes dos parâmetros.
  if (config.params && isConvertibleBody(config.params)) {
    config.params = jsonToSnakeCase(config.params, { deep: false });
  }

  return config;
});

/**
 * Só a área da unidade (`/unit`) tem sessão. Um 401 ali significa que o
 * cookie expirou: volta para o login. No fluxo do paciente (anônimo) um 401
 * nunca acontece — e o próprio login (POST /sessions) responde 401 para
 * credencial errada, que precisa chegar ao formulário como erro comum.
 */
function shouldRedirectToSignIn(error: unknown): boolean {
  if (typeof window === 'undefined') return false;
  if (!(error instanceof AxiosError) || error.response?.status !== 401) return false;

  const isSignInRequest =
    error.config?.url === '/sessions' && error.config?.method?.toLowerCase() === 'post';

  return !isSignInRequest && window.location.pathname.startsWith('/unit');
}

function redirectToSignIn(): void {
  // Navegação "dura" de propósito, e não `router.push`: recarregar a página
  // descarta todo o estado em memória (cache do React Query, formulários
  // abertos). Este módulo não é um componente — não há router aqui.
  const redirect = encodeURIComponent(window.location.pathname);
  window.location.href = `/signin?redirect=${redirect}`;
}

/**
 * Requisições com `responseType: 'blob'` recebem o corpo do erro como Blob em
 * vez de JSON já parseado, então precisamos ler e decodificar na mão.
 */
async function extractBlobErrorMessage(data: unknown): Promise<string | undefined> {
  if (typeof Blob === 'undefined' || !(data instanceof Blob)) return undefined;

  try {
    const parsed = JSON.parse(await data.text());

    return typeof parsed?.error === 'string' ? parsed.error : undefined;
  } catch {
    return undefined;
  }
}

async function toErrorMessage(error: unknown): Promise<string> {
  if (!(error instanceof AxiosError)) return DEFAULT_ERROR_MESSAGE;

  if (error.response?.status === 429) {
    return 'Muitas requisições. Tente novamente mais tarde.';
  }

  const fromBlob = await extractBlobErrorMessage(error.response?.data);
  if (fromBlob) return fromBlob;

  // O backend responde `{ error: 'mensagem' }` em toda falha tratada.
  const fromBody = error.response?.data?.error;

  return typeof fromBody === 'string' && fromBody ? fromBody : DEFAULT_ERROR_MESSAGE;
}

api.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers['content-type'] || '');

    if (contentType.includes('application/json')) {
      response.data = jsonToCamelCase(response.data);
    }

    return response;
  },
  async (error) => {
    if (shouldRedirectToSignIn(error)) redirectToSignIn();

    throw new Error(await toErrorMessage(error));
  },
);

/**
 * Converte um erro em `Error` com mensagem exibível fora do fluxo do
 * interceptor (ex.: um `try/catch` em volta de `axios` puro).
 *
 * No fluxo normal você NÃO precisa disso: o interceptor já entrega um `Error`
 * pronto, e os formulários usam `toast.promise(..., { error: (e) => e.message })`.
 */
function parseApiError(error: unknown): Promise<Error> {
  return toErrorMessage(error).then((message) => new Error(message));
}

export { api, parseApiError };
