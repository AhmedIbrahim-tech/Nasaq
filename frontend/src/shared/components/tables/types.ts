import { ReactNode } from 'react';
import type { DataTableTabsProps } from '@/shared/components/tables/DataTableTabs';

export type TableAlign = 'start' | 'center' | 'end' | 'left' | 'right';

export function resolveTableColumnAlignment(align?: TableAlign): {
  textAlign: 'start' | 'center' | 'end';
  justifyContent: 'flex-start' | 'center' | 'flex-end';
  alignItems: 'flex-start' | 'center' | 'flex-end';
} {
  if (align === 'center') {
    return {
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    };
  }
  if (align === 'end' || align === 'right') {
    return {
      textAlign: 'end',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    };
  }
  return {
    textAlign: 'start',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  };
}

export interface TableColumn<T> {
  /** Unique column identifier */
  id: string;
  /** Header label or custom header render function */
  header: ReactNode | ((props: { isAllSelected: boolean; isIndeterminate: boolean; onToggleAll: () => void }) => ReactNode);
  /** Property key or nested accessor string (e.g. "customer.name") */
  accessorKey?: keyof T | string;
  /** Custom accessor function to extract cell value from row */
  accessorFn?: (row: T) => any;
  /** Custom cell render function */
  cell?: (props: {
    row: T;
    value: any;
    index: number;
    isSelected: boolean;
    isExpanded: boolean;
    toggleExpand: () => void;
  }) => ReactNode;
  /** Whether column can be sorted */
  sortable?: boolean;
  /** Minimum column width */
  minWidth?: number | string;
  /** Column width */
  width?: number | string;
  /** Alignment of header and cell content */
  align?: TableAlign;
  /** Whether column is visible by default (defaults to true) */
  defaultVisible?: boolean;
  /** Optional column tooltip or description */
  tooltip?: string;
}

export interface TableRowActionHelpers {
  toggleExpand: () => void;
  isExpanded?: boolean;
}

export interface TableRowAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T, helpers?: TableRowActionHelpers) => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
  divider?: boolean;
  group?: string;
}

export interface TableToolbarAction {
  id: string;
  label?: string;
  icon: ReactNode;
  onClick: () => void;
  tooltip?: string;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'default';
  disabled?: boolean;
  variant?: 'icon' | 'button';
}

export interface TableFilterOption {
  label: string;
  value: string | number;
}

export interface TableFilterField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: TableFilterOption[];
  placeholder?: string;
  value?: any;
}

export interface PaginationConfig {
  page: number; // 0-indexed for MUI TablePagination
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

export interface SortingConfig {
  orderBy: string | null;
  order: 'asc' | 'desc';
  onSortChange: (columnId: string) => void;
}

export interface SelectionConfig<T> {
  selectedIds: Array<string | number>;
  getRowId?: (row: T, index?: number) => string | number;
  onSelectionChange: (selectedIds: Array<string | number>, selectedRows: T[]) => void;
  onBulkDelete?: (selectedIds: Array<string | number>) => void | Promise<void>;
  isSelectable?: (row: T) => boolean;
  confirmDelete?: boolean;
  bulkDeleteTitle?: string;
  bulkDeleteMessage?: (count: number) => string;
  bulkDeleteMaxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface DataTableKpiCard {
  label: string;
  value: string | number;
  icon: ReactNode;
  bgcolor?: string;
  color?: string;
  progress?: number;
}

export interface InlineEditingConfig<T> {
  editingRowId: string | number | null;
  onStartEdit?: (row: T) => void;
  onSaveEdit?: (row: T, updatedData: Partial<T>) => void | Promise<void>;
  onCancelEdit?: () => void;
}

export interface DataTableProps<T> {
  /** Optional top header title or React node */
  title?: ReactNode;
  /** Orders Table style 6-card KPI/Progress cards row */
  kpiCards?: DataTableKpiCard[];
  /** Optional title for the KPI cards section (e.g. "Orders History" or "Users Overview") */
  kpiTitle?: ReactNode;
  /** Loading state for KPI cards */
  kpiLoading?: boolean;
  /** Top slot above toolbar (e.g. statistics/summary cards) */
  headerSlot?: ReactNode;
  /** Modernize User Table styled horizontal category/role filter tabs */
  tabs?: DataTableTabsProps;
  /** Primary action button (e.g. Create User, Add Tenant) positioned opposite tabs or on sub-header */
  primaryAction?: ReactNode;
  /** Row data array */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Custom function to extract unique row id */
  getRowId?: (row: T, index?: number) => string | number;
  /** Loading state */
  isLoading?: boolean;
  /** Error state message or node */
  error?: ReactNode | null;
  /** Retry callback when in error state */
  onRetry?: () => void;
  /** Custom empty state message or node */
  emptyMessage?: ReactNode;
  /** Search and Toolbar options */
  toolbar?: {
    title?: ReactNode;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    showFilterToggle?: boolean;
    isFilterOpen?: boolean;
    onToggleFilter?: () => void;
    hasActiveFilters?: boolean;
    onResetFilters?: () => void;
    activeFiltersCount?: number;
    filtersContent?: ReactNode;
    showColumnVisibility?: boolean;
    onDownloadCsv?: () => void;
    actions?: TableToolbarAction[];
  };
  /** Row selection options */
  selection?: SelectionConfig<T>;
  /** Column sorting options */
  sorting?: SortingConfig;
  /** Pagination options */
  pagination?: PaginationConfig;
  /** Row-level actions (shown in More menu or inline) */
  rowActions?: TableRowAction<T>[] | ((row: T, helpers?: TableRowActionHelpers) => TableRowAction<T>[]);
  /** Callback fired when a table row is double-clicked (typically to open Details) */
  onRowDoubleClick?: (row: T) => void;
  /** Inline row editing options matching Orders Table */
  inlineEditing?: InlineEditingConfig<T>;
  /** Custom expandable row details render function */
  renderExpandedRow?: (row: T) => ReactNode;
  /** Table density */
  dense?: boolean;
  /** Custom container styling */
  elevation?: number;
  /** Card variant */
  variant?: 'elevation' | 'outlined';
  /** Custom Card sx */
  sx?: any;
}
