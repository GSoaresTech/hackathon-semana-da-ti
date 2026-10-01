import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '~/libs/env';
import { jsonToCamelCase, jsonToSnakeCase } from '~/libs/utils';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Instância única de HTTP do projeto. TODA chamada à API passa por aqui,
 * sempre através de uma função em `~/services/*`.
 *
 * Responsabilidades:
 * - Autenticação por cookie httpOnly (`withCredentials`), sem token em JS.
 * - Tradução do contrato: `camelCase` no front, `snake_case` no backend.
 * - Renovação de sessão em 401, com uma única tentativa por requisição.
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
 * Endpoint de renovação de sessão.
 *
 * `null` porque o backend deste projeto (idh-server) NÃO expõe refresh: o
 * cookie de sessão vale 1 dia e simplesmente expira. Com `null`, um 401 leva
 * direto para `/signin`.
 *
 * Se o seu backend tiver refresh, basta apontar aqui (ex.: `/sessions/refresh`)
 * — toda a mecânica abaixo (tentativa única, single-flight, serialização entre
 * abas) passa a valer sem mais nenhuma mudança.
 */
const REFRESH_ENDPOINT: string | null = null;

/**
 * Um 401 nos próprios endpoints de sessão significa credencial inválida, não
 * sessão expirada. Tentar renovar aí geraria recursão.
 */
function isAuthEndpoint(config?: InternalAxiosRequestConfig): boolean {
  const url = config?.url ?? '';
  const method = (config?.method ?? '').toLowerCase();

  if (REFRESH_ENDPOINT && url === REFRESH_ENDPOINT) return true;
  if (url === '/sessions/authenticate') return true;

  return url === '/sessions' && method === 'post';
}

const REFRESH_LOCK_NAME = 'session-refresh';
const REFRESH_LAST_AT_KEY = 'app:lastSessionRefreshAt';
const REFRESH_DEDUPE_WINDOW_MS = 60 * 1000;

function getLastRefreshAt(): number {
  try {
    return Number(window.localStorage.getItem(REFRESH_LAST_AT_KEY) || 0);
  } catch {
    return 0;
  }
}

function setLastRefreshAt(timestamp: number): void {
  try {
    window.localStorage.setItem(REFRESH_LAST_AT_KEY, String(timestamp));
  } catch {
    // localStorage indisponível (aba anônima, cookies bloqueados): seguimos sem
    // o cache entre abas. O navigator.locks ainda protege a corrida.
  }
}

async function performRefresh(): Promise<void> {
  if (!REFRESH_ENDPOINT) throw new Error('Sessão expirada');

  // Outra aba já renovou há pouco: o refresh_token dela foi rotacionado e o
  // nosso já está obsoleto, então tentar de novo só causaria logout.
  if (Date.now() - getLastRefreshAt() < REFRESH_DEDUPE_WINDOW_MS) return;

  await api.post(REFRESH_ENDPOINT, {});
  setLastRefreshAt(Date.now());
}

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    // navigator.locks serializa a renovação entre abas do mesmo navegador: como
    // o refresh_token é de uso único, duas abas renovando ao mesmo tempo fariam
    // a segunda falhar (token já consumido) e deslogar o usuário.
    const run =
      typeof navigator !== 'undefined' && 'locks' in navigator
        ? navigator.locks.request<void>(REFRESH_LOCK_NAME, () => performRefresh())
        : performRefresh();

    refreshPromise = run.finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function redirectToSignIn(): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/signin')) return;

  // Navegação "dura" de propósito, e não `router.push`: recarregar a página
  // descarta todo o estado em memória (cache do React Query, stores do
  // Zustand, formulários abertos). Sem isso, dados do usuário cuja sessão
  // acabou continuariam na tela depois do login de outra pessoa.
  // Além disso, este módulo não é um componente — não há router aqui.
  window.location.href = '/signin';
}

async function refreshSessionOrSignOut(): Promise<boolean> {
  try {
    await refreshSession();

    return true;
  } catch {
    redirectToSignIn();

    return false;
  }
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
    const config = error?.config as RetryableRequestConfig | undefined;

    const shouldTryRefresh =
      typeof window !== 'undefined' &&
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      !!config &&
      !config._retry &&
      !isAuthEndpoint(config) &&
      !window.location.pathname.startsWith('/signin');

    if (shouldTryRefresh) {
      config._retry = true;

      if (REFRESH_ENDPOINT) {
        if (await refreshSessionOrSignOut()) {
          return api.request(config);
        }
      } else {
        // Sem refresh disponível: a sessão acabou, não há o que recuperar.
        redirectToSignIn();
      }
    }

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

export { api, parseApiError, refreshSessionOrSignOut };
