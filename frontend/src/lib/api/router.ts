const ROOT = "/api";
const VERSION = "v1";
const PREFIX = `${ROOT}/${VERSION}`;

export const Router = {
  Auth: {
    Prefix: `${PREFIX}/auth`,
    Login: `${PREFIX}/auth/login`,
    Refresh: `${PREFIX}/auth/refresh`,
    Logout: `${PREFIX}/auth/logout`,
    Me: `${PREFIX}/auth/me`,
    Profile: `${PREFIX}/auth/me/profile`,
    ChangePassword: `${PREFIX}/auth/me/change-password`,
    FirstLoginChangePassword: `${PREFIX}/auth/first-login-change-password`,
    ForgotPassword: `${PREFIX}/auth/forgot-password`,
    PendingPasswordRequests: `${PREFIX}/auth/password-requests`,
    ApprovePasswordRequest: (id: string) => `${PREFIX}/auth/password-requests/${encodeURIComponent(id)}/approve`,
    RejectPasswordRequest: (id: string) => `${PREFIX}/auth/password-requests/${encodeURIComponent(id)}/reject`,
    AdminResetPassword: (userId: string) => `${PREFIX}/auth/users/${encodeURIComponent(userId)}/reset-password`,
    AdminDirectChangePassword: (userId: string) => `${PREFIX}/auth/users/${encodeURIComponent(userId)}/direct-change-password`,
  },

  Notifications: {
    Prefix: `${PREFIX}/notifications`,
    GetById: (id: string | number) => `${PREFIX}/notifications/${encodeURIComponent(id)}`,
    MarkRead: (id: string | number) => `${PREFIX}/notifications/${encodeURIComponent(id)}/read`,
    ReadAll: `${PREFIX}/notifications/read-all`,
    UnreadCount: `${PREFIX}/notifications/unread-count`,
    Recent: `${PREFIX}/notifications/recent`,
  },

  Employees: {
    Prefix: `${PREFIX}/employees`,
    List: `${PREFIX}/employees`,
    Summary: `${PREFIX}/employees/summary`,
    Create: `${PREFIX}/employees`,
    Supervisors: `${PREFIX}/employees/supervisors`,
    MyProfile: `${PREFIX}/employees/me`,
    MyProfilePhoto: `${PREFIX}/employees/me/photo`,
    GetById: (id: string) => `${PREFIX}/employees/${encodeURIComponent(id)}`,
    Update: (id: string) => `${PREFIX}/employees/${encodeURIComponent(id)}`,
    ToggleStatus: (id: string) => `${PREFIX}/employees/${encodeURIComponent(id)}/status`,
    Delete: (id: string) => `${PREFIX}/employees/${encodeURIComponent(id)}`,
    BulkDelete: `${PREFIX}/employees/bulk-delete`,
  },

  Files: {
    Prefix: `${PREFIX}/files`,
    List: (category: string, ownerId: string) =>
      `${PREFIX}/files?category=${encodeURIComponent(category)}&ownerId=${encodeURIComponent(ownerId)}`,
    Upload: `${PREFIX}/files/upload`,
    GetById: (id: string) => `${PREFIX}/files/${encodeURIComponent(id)}`,
    Download: (id: string) => `${PREFIX}/files/${encodeURIComponent(id)}/download`,
  },

  Locations: {
    Prefix: `${PREFIX}/locations`,
    List: `${PREFIX}/locations`,
    Summary: `${PREFIX}/locations/summary`,
    Create: `${PREFIX}/locations`,
    GetById: (id: string) => `${PREFIX}/locations/${encodeURIComponent(id)}`,
    Update: (id: string) => `${PREFIX}/locations/${encodeURIComponent(id)}`,
    ToggleStatus: (id: string) => `${PREFIX}/locations/${encodeURIComponent(id)}/status`,
    Delete: (id: string) => `${PREFIX}/locations/${encodeURIComponent(id)}`,
    BulkDelete: `${PREFIX}/locations/bulk-delete`,
    GlobalRadius: `${PREFIX}/locations/global-radius`,
    UpdateCoordinates: (id: string) => `${PREFIX}/locations/${encodeURIComponent(id)}/coordinates`,
    MyPersonalLocation: `${PREFIX}/locations/my-personal`,
    RegisterPersonalLocation: `${PREFIX}/locations/register-personal`,
    RequestLocationChange: `${PREFIX}/locations/request-change`,
    CancelLocationRequest: (id: string) => `${PREFIX}/locations/requests/${encodeURIComponent(id)}/cancel`,
    PendingLocationRequests: `${PREFIX}/locations/requests/pending`,
    ApproveLocationRequest: (id: string) => `${PREFIX}/locations/requests/${encodeURIComponent(id)}/approve`,
    RejectLocationRequest: (id: string) => `${PREFIX}/locations/requests/${encodeURIComponent(id)}/reject`,
    AdminChangeEmployeeLocation: (employeeId: string) => `${PREFIX}/locations/employees/${encodeURIComponent(employeeId)}/change-location`,
    ResetEmployeeLocation: (employeeId: string) => `${PREFIX}/locations/employees/${encodeURIComponent(employeeId)}/reset-location`,
  },

  Shifts: {
    Prefix: `${PREFIX}/shifts`,
    List: `${PREFIX}/shifts`,
    Summary: `${PREFIX}/shifts/summary`,
    Create: `${PREFIX}/shifts`,
    GetById: (id: string) => `${PREFIX}/shifts/${encodeURIComponent(id)}`,
    Update: (id: string) => `${PREFIX}/shifts/${encodeURIComponent(id)}`,
    ToggleStatus: (id: string) => `${PREFIX}/shifts/${encodeURIComponent(id)}/status`,
    Delete: (id: string) => `${PREFIX}/shifts/${encodeURIComponent(id)}`,
  },

  Schedules: {
    Prefix: `${PREFIX}/schedules`,
    List: `${PREFIX}/schedules`,
    Summary: `${PREFIX}/schedules/summary`,
    Create: `${PREFIX}/schedules`,
    GetById: (id: string) => `${PREFIX}/schedules/${encodeURIComponent(id)}`,
    Update: (id: string) => `${PREFIX}/schedules/${encodeURIComponent(id)}`,
    ToggleStatus: (id: string) => `${PREFIX}/schedules/${encodeURIComponent(id)}/status`,
    Delete: (id: string) => `${PREFIX}/schedules/${encodeURIComponent(id)}`,
    Assignments: `${PREFIX}/schedules/assignments`,
    AssignmentById: (id: string) => `${PREFIX}/schedules/assignments/${encodeURIComponent(id)}`,
  },

  Attendance: {
    CheckIn: `${PREFIX}/attendance/check-in`,
    CheckOut: `${PREFIX}/attendance/check-out`,
    Status: `${PREFIX}/attendance/status`,
    MyHistory: `${PREFIX}/attendance/my-history`,
    List: `${PREFIX}/attendance`,
    GetById: (id: string) => `${PREFIX}/attendance/${encodeURIComponent(id)}`,
  },

  Points: {
    MySummary: `${PREFIX}/points/me/summary`,
    MyTransactions: `${PREFIX}/points/me/transactions`,
    Transactions: `${PREFIX}/points/transactions`,
    Rules: `${PREFIX}/points/rules`,
    RuleById: (id: string) => `${PREFIX}/points/rules/${encodeURIComponent(id)}`,
    RuleToggleStatus: (id: string) => `${PREFIX}/points/rules/${encodeURIComponent(id)}/status`,
    Evaluate: `${PREFIX}/points/evaluate`,
    Reverse: (id: string) => `${PREFIX}/points/transactions/${encodeURIComponent(id)}/reverse`,
  },

  Leaves: {
    Prefix: `${PREFIX}/leaves`,
    Types: `${PREFIX}/leaves/types`,
    TypeById: (id: string) => `${PREFIX}/leaves/types/${encodeURIComponent(id)}`,
    TypeToggleStatus: (id: string) => `${PREFIX}/leaves/types/${encodeURIComponent(id)}/status`,
    Requests: `${PREFIX}/leaves/requests`,
    MyRequests: `${PREFIX}/leaves/requests/my`,
    RequestById: (id: string) => `${PREFIX}/leaves/requests/${encodeURIComponent(id)}`,
    CancelRequest: (id: string) => `${PREFIX}/leaves/requests/${encodeURIComponent(id)}/cancel`,
    Approvals: `${PREFIX}/leaves/approvals`,
    Approve: (id: string) => `${PREFIX}/leaves/approvals/${encodeURIComponent(id)}/approve`,
    Reject: (id: string) => `${PREFIX}/leaves/approvals/${encodeURIComponent(id)}/reject`,
    Summary: `${PREFIX}/leaves/summary`,
  },

  AdminOperations: {
    Summary: `${PREFIX}/admin-operations/summary`,
    DailyAttendance: `${PREFIX}/admin-operations/attendance/daily`,
    GpsExceptions: `${PREFIX}/admin-operations/attendance/gps-exceptions`,
    ApproveGps: (id: string) => `${PREFIX}/admin-operations/attendance/${encodeURIComponent(id)}/approve`,
    RejectGps: (id: string) => `${PREFIX}/admin-operations/attendance/${encodeURIComponent(id)}/reject`,
    IncompleteAttendance: `${PREFIX}/admin-operations/attendance/incomplete`,
    CorrectIncomplete: (id: string) => `${PREFIX}/admin-operations/attendance/${encodeURIComponent(id)}/correct`,
    ManualPointAdjustment: `${PREFIX}/admin-operations/points/adjust`,
  },

  Reports: {
    Catalog: `${PREFIX}/reports/catalog`,
    Execute: `${PREFIX}/reports/execute`,
    Export: `${PREFIX}/reports/export`,
  },

  Hubs: {
    Notifications: `${PREFIX}/hubs/notifications`,
  },
} as const;
