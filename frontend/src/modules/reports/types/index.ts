export interface ReportCatalogItem {
  id: string;
  category: string;
  reportType: "summary" | "ledger" | "statement" | "directory";
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  requiredPermission: string;
  supportedFilters: string[];
}

export interface ReportColumn {
  key: string;
  labelAr: string;
  labelEn: string;
  type: "string" | "number" | "currency" | "date" | "badge";
  align?: "left" | "center" | "right";
}

export interface ReportSummaryKpi {
  key: string;
  labelAr: string;
  labelEn: string;
  value: number;
  type: "number" | "currency";
}

export interface ReportFilterRequest {
  reportId: string;
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
  workLocationId?: string;
  workShiftId?: string;
  department?: string;
  status?: string;
  pointCategory?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  exportFormat?: "csv" | "xlsx" | "pdf";
  exportScope?: "all" | "current_page";
  language?: "ar" | "en";
}

export interface ReportResult {
  reportId: string;
  reportNameAr: string;
  reportNameEn: string;
  generatedAt: string;
  totalRecords: number;
  columns: ReportColumn[];
  rows: Record<string, any>[];
  summaryKpis: ReportSummaryKpi[];
}
