import {
  IconLayoutDashboard,
  IconUserCircle,
  IconBell,
} from "@tabler/icons-react";

const Menuitems = [
  // 1. Dashboard
  {
    id: "h-nav-dashboard",
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    scope: "shared",
  },

  // 2. Account & Support
  {
    id: "h-nav-profile",
    title: "My Profile",
    icon: IconUserCircle,
    href: "/profile",
    scope: "shared",
  },
  {
    id: "h-nav-notifications",
    title: "Notifications",
    icon: IconBell,
    href: "/notifications",
    scope: "shared",
  },
];

export default Menuitems;
