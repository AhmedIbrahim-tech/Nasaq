import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse } from "@/shared/types/api.types";
import type { ReportCatalogItem, ReportFilterRequest, ReportResult } from "../types";

export const reportsService = {
  async getCatalog(): Promise<ReportCatalogItem[]> {
    const response = await api.get<GenericBaseResponse<ReportCatalogItem[]>>(
      Router.Reports.Catalog
    );
    return response.data.data || [];
  },

  async executeReport(filter: ReportFilterRequest): Promise<ReportResult> {
    const response = await api.post<GenericBaseResponse<ReportResult>>(
      Router.Reports.Execute,
      filter
    );
    return response.data.data!;
  },

  async exportReport(filter: ReportFilterRequest): Promise<void> {
    const response = await api.post(Router.Reports.Export, filter, {
      responseType: "blob",
    });

    const contentDisposition = typeof response.headers["content-disposition"] === "string"
      ? response.headers["content-disposition"]
      : "";
    let filename = `${filter.reportId}_${new Date().toISOString().slice(0, 10)}.${filter.exportFormat || "csv"}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "").trim();
      }
    }

    const contentType = typeof response.headers["content-type"] === "string"
      ? response.headers["content-type"]
      : "application/octet-stream";

    const blob = new Blob([response.data], {
      type: contentType,
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
