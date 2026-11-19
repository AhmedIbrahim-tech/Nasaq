export const RoleNames = {
  SuperAdmin: "SuperAdmin",
  Admin: "Admin",
  User: "User",
} as const;

export type RoleName = typeof RoleNames[keyof typeof RoleNames];
