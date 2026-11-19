/**
 * Centralized Generic Lookup DTOs
 */

export interface LookupOptionDto {
  value: string;
  label: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface LookupFilterRequest {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}
