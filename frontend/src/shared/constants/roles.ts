export const RoleNames = {
  SuperAdmin: "SuperAdmin",
  Admin: "Admin",
  Supervisor: "Supervisor",
  Employee: "Employee",
  User: "Employee",
} as const;

export type RoleName = typeof RoleNames[keyof typeof RoleNames];

