import {
  IconLayoutDashboard,
  IconReportAnalytics,
  IconUserCircle,
  IconBell,
  IconUsers,
} from "@tabler/icons-react";
import { RoleNames } from "@/shared/constants/roles";

export interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  exact?: boolean;
  children?: MenuitemsType[];
  roles?: string[];
  permission?: string;
  permissions?: string[];
  scope?: "platform" | "tenant" | "shared";
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

const Menuitems: MenuitemsType[] = [
  // 1. Main
  {
    navlabel: true,
    subheader: "Main",
    scope: "shared",
  },
  {
    id: "nav-dashboard",
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    scope: "shared",
  },

  // 2. Workforce Management
  {
    navlabel: true,
    subheader: "Workforce",
    roles: [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor],
    scope: "shared",
  },
  {
    id: "nav-employees",
    title: "Employees",
    icon: IconUsers,
    href: "/employees",
    roles: [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor],
    scope: "shared",
  },

  // 3. Account & Support
  {
    navlabel: true,
    subheader: "Account & Support",
    scope: "shared",
  },
  {
    id: "nav-profile",
    title: "My Profile",
    icon: IconUserCircle,
    href: "/profile",
    scope: "shared",
  },
  {
    id: "nav-notifications",
    title: "Notifications",
    icon: IconBell,
    href: "/notifications",
    scope: "shared",
  },
];

export default Menuitems;
