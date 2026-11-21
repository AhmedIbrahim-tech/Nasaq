import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse, PaginatedResult } from "@/shared/types/api.types";
import type {
  PointRule,
  PointTransaction,
  EmployeePointsSummary,
  CreatePointRuleRequest,
  UpdatePointRuleRequest,
  PointTransactionsParams,
} from "../types";

export const pointsService = {
  async getMySummary(): Promise<EmployeePointsSummary> {
    const response = await api.get<GenericBaseResponse<EmployeePointsSummary>>(
      Router.Points.MySummary
    );
    return response.data.data!;
  },

  async getMyTransactions(params: PointTransactionsParams = {}): Promise<PaginatedResult<PointTransaction>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<PointTransaction>>>(
      Router.Points.MyTransactions,
      { params }
    );
    return response.data.data!;
  },

  async getTransactions(params: PointTransactionsParams = {}): Promise<PaginatedResult<PointTransaction>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<PointTransaction>>>(
      Router.Points.Transactions,
      { params }
    );
    return response.data.data!;
  },

  async reverseTransaction(id: string, reason: string): Promise<PointTransaction> {
    const response = await api.post<GenericBaseResponse<PointTransaction>>(
      Router.Points.Reverse(id),
      { reason }
    );
    return response.data.data!;
  },

  async evaluateAttendance(attendanceRecordId: string): Promise<PointTransaction[]> {
    const response = await api.post<GenericBaseResponse<PointTransaction[]>>(
      Router.Points.Evaluate,
      { attendanceRecordId }
    );
    return response.data.data!;
  },

  async getRules(params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResult<PointRule>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<PointRule>>>(
      Router.Points.Rules,
      { params }
    );
    return response.data.data!;
  },

  async getRuleById(id: string): Promise<PointRule> {
    const response = await api.get<GenericBaseResponse<PointRule>>(
      Router.Points.RuleById(id)
    );
    return response.data.data!;
  },

  async createRule(data: CreatePointRuleRequest): Promise<PointRule> {
    const response = await api.post<GenericBaseResponse<PointRule>>(
      Router.Points.Rules,
      data
    );
    return response.data.data!;
  },

  async updateRule(id: string, data: UpdatePointRuleRequest): Promise<PointRule> {
    const response = await api.put<GenericBaseResponse<PointRule>>(
      Router.Points.RuleById(id),
      data
    );
    return response.data.data!;
  },

  async toggleRuleStatus(id: string): Promise<PointRule> {
    const response = await api.patch<GenericBaseResponse<PointRule>>(
      Router.Points.RuleToggleStatus(id)
    );
    return response.data.data!;
  },
};
