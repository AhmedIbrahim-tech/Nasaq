/**
 * Canonical permission identifiers matching backend Domain.Authorization.Permissions.
 */
export const PlatformPermissions = {
  ViewDashboard: "Permissions.Platform.ViewDashboard",
  ViewTenants: "Permissions.Platform.ViewTenants",
  ViewTenantDetails: "Permissions.Platform.ViewTenantDetails",
  ExportTenants: "Permissions.Platform.ExportTenants",
  ViewUsers: "Permissions.Platform.ViewUsers",
  ViewUserDetails: "Permissions.Platform.ViewUserDetails",
  ExportUsers: "Permissions.Platform.ExportUsers",
  ViewRoles: "Permissions.Platform.ViewRoles",
  OnboardTenant: "Permissions.Platform.OnboardTenant",
} as const;

export type PlatformPermission =
  (typeof PlatformPermissions)[keyof typeof PlatformPermissions];

export const TenantPermissions = {
  Users: {
    View: "Permissions.Users.View",
    Create: "Permissions.Users.Create",
    Update: "Permissions.Users.Update",
    Disable: "Permissions.Users.Disable",
  },
  Roles: {
    View: "Permissions.Roles.View",
    Manage: "Permissions.Roles.Manage",
  },
  Clients: {
    View: "Permissions.Clients.View",
    Create: "Permissions.Clients.Create",
    Update: "Permissions.Clients.Update",
    Delete: "Permissions.Clients.Delete",
  },
  Suppliers: {
    View: "Permissions.Suppliers.View",
    Create: "Permissions.Suppliers.Create",
    Update: "Permissions.Suppliers.Update",
    Delete: "Permissions.Suppliers.Delete",
  },
  Sales: {
    View: "Permissions.Sales.View",
    Create: "Permissions.Sales.Create",
    Edit: "Permissions.Sales.Edit",
    Post: "Permissions.Sales.Post",
    Cancel: "Permissions.Sales.Cancel",
    Return: "Permissions.Sales.Return",
    ViewFinancialDetails: "Permissions.Sales.ViewFinancialDetails",
    ManageDiscounts: "Permissions.Sales.ManageDiscounts",
    ManagePrices: "Permissions.Sales.ManagePrices",
    Print: "Permissions.Sales.Print",
  },
  Purchases: {
    View: "Permissions.Purchases.View",
    Create: "Permissions.Purchases.Create",
    Edit: "Permissions.Purchases.Edit",
    Approve: "Permissions.Purchases.Approve",
    Receive: "Permissions.Purchases.Receive",
    Post: "Permissions.Purchases.Post",
    Cancel: "Permissions.Purchases.Cancel",
    Return: "Permissions.Purchases.Return",
    RecordPayment: "Permissions.Purchases.RecordPayment",
    ViewFinancialDetails: "Permissions.Purchases.ViewFinancialDetails",
    Print: "Permissions.Purchases.Print",
  },
  Inventory: {
    View: "Permissions.Inventory.View",
    CreateProduct: "Permissions.Inventory.CreateProduct",
    EditProduct: "Permissions.Inventory.EditProduct",
    DeleteProduct: "Permissions.Inventory.DeleteProduct",
    ViewWarehouses: "Permissions.Inventory.ViewWarehouses",
    ManageWarehouses: "Permissions.Inventory.ManageWarehouses",
    Adjust: "Permissions.Inventory.Adjust",
    Transfer: "Permissions.Inventory.Transfer",
    ViewMovements: "Permissions.Inventory.ViewMovements",
    ViewValuation: "Permissions.Inventory.ViewValuation",
  },
  Treasury: {
    View: "Permissions.Treasury.View",
    Manage: "Permissions.Treasury.Manage",
    Deposit: "Permissions.Treasury.Deposit",
    Withdraw: "Permissions.Treasury.Withdraw",
    Transfer: "Permissions.Treasury.Transfer",
    ViewOperations: "Permissions.Treasury.ViewOperations",
    ViewDashboard: "Permissions.Treasury.ViewDashboard",
  },
  BankAccounts: {
    View: "Permissions.BankAccounts.View",
    Manage: "Permissions.BankAccounts.Manage",
    Deposit: "Permissions.BankAccounts.Deposit",
    Withdraw: "Permissions.BankAccounts.Withdraw",
    Transfer: "Permissions.BankAccounts.Transfer",
    ViewOperations: "Permissions.BankAccounts.ViewOperations",
  },
  Expenses: {
    View: "Permissions.Expenses.View",
    Create: "Permissions.Expenses.Create",
    Cancel: "Permissions.Expenses.Cancel",
    ViewKpis: "Permissions.Expenses.ViewKpis",
  },
  Employees: {
    View: "Permissions.Employees.View",
    Create: "Permissions.Employees.Create",
    Edit: "Permissions.Employees.Edit",
    Delete: "Permissions.Employees.Delete",
    ViewKpis: "Permissions.Employees.ViewKpis",
  },
  Salaries: {
    View: "Permissions.Salaries.View",
    Disburse: "Permissions.Salaries.Disburse",
    Cancel: "Permissions.Salaries.Cancel",
    ViewKpis: "Permissions.Salaries.ViewKpis",
  },
  Contributors: {
    View: "Permissions.Contributors.View",
    Create: "Permissions.Contributors.Create",
    Edit: "Permissions.Contributors.Edit",
    Delete: "Permissions.Contributors.Delete",
    ViewKpis: "Permissions.Contributors.ViewKpis",
    DisburseProfit: "Permissions.Contributors.DisburseProfit",
    CorrectProfit: "Permissions.Contributors.CorrectProfit",
    CancelProfit: "Permissions.Contributors.CancelProfit",
  },
  Reports: {
    View: "Permissions.Reports.View",
    Export: "Permissions.Reports.Export",
  },
} as const;
