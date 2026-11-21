/**
 * Standard API response wrapper matching Backend GenericBaseResponse<T>
 */
export interface GenericBaseResponse<T = unknown> {
  statusCode: number;
  succeeded: boolean;
  message?: string | null;
  errors?: string[] | null;
  meta?: unknown;
  data?: T | null;
}

/**
 * Generic Paginated Result matching Backend PaginatedListResponse<T>
 */
export interface PaginatedResult<T = unknown> {
  items: T[];
  data?: T[];
  totalCount: number;
  currentPage?: number;
  pageNumber?: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
