/**
 * Formato de listagem paginada do backend.
 *
 * O backend responde `total_pages`; o interceptor do axios converte para
 * `totalPages` antes de a resposta chegar aqui.
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  data: T[];
}
