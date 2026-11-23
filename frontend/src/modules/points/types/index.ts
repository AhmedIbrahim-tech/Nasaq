export type PointCategory = "Green" | "Red" | "Black";

export type PointEventType =
  | "OnTimeArrival"
  | "LateArrival"
  | "AfterCutoffArrival"
  | "EarlyDeparture"
  | "CompletedShift"
  | "MissingCheckOut"
  | "GeofenceBreach"
  | "ManualAdjustment";

export type PointTransactionStatus = "Finalized" | "PendingReview" | "Reversed";

export interface PointRule {
  id: string;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  category: PointCategory;
  eventType: PointEventType;
  points: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  version: number;
  created_Utc: string;
  created_By?: string | null;
}

export interface PointTransaction {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  employeeNameAr?: string | null;
  employeeCode?: string | null;
  ruleId?: string | null;
  ruleName?: string | null;
  ruleNameAr?: string | null;
  category: PointCategory;
  eventType: PointEventType;
  points: number;
  status: PointTransactionStatus;
  sourceEventType?: string | null;
  sourceEventId?: string | null;
  date: string;
  timestampUtc: string;
  reason: string;
  relatedTransactionId?: string | null;
  created_Utc: string;
  created_By?: string | null;
}

export interface EmployeePointsSummary {
  employeeId: string;
  employeeName: string;
  totalFinalizedPoints: number;
  greenPoints: number;
  redPoints: number;
  blackPoints: number;
  pendingPoints: number;
  recentTransactions: PointTransaction[];
}

export interface CreatePointRuleRequest {
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  category: PointCategory;
  eventType: PointEventType;
  points: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdatePointRuleRequest {
  id: string;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  category: PointCategory;
  eventType: PointEventType;
  points: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface PointTransactionsParams {
  employeeId?: string;
  category?: PointCategory;
  eventType?: PointEventType;
  status?: PointTransactionStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
