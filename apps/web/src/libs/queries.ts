/**
 * Chaves do TanStack Query.
 *
 * Toda chave nova entra aqui — nunca use string solta em `queryKey`. Assim
 * `invalidateQueries` sempre encontra a mesma referência e o autocomplete
 * mostra o que já existe antes de você duplicar uma chave.
 *
 * Convenção: membro em SCREAMING_SNAKE_CASE, valor em kebab-case.
 * Filtros vão no segundo item do array, nunca no nome da chave:
 *
 *   queryKey: [QUERIES.LIST_USERS, { page, search }]
 */
export enum QUERIES {
  GET_SESSION = 'get-session',
  LIST_USERS = 'list-users',
  GET_USER = 'get-user',
}
