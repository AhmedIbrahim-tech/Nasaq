import { EmployeeListView } from "@/modules/employees";

export const metadata = {
  title: "Employee Management — Nasaq",
  description: "Manage employee profiles, employment data, and workforce operations",
};

export default function EmployeesPage() {
  return <EmployeeListView />;
}
