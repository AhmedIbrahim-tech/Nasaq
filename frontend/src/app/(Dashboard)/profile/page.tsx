import { MyProfileView } from "@/modules/core/profile/views/MyProfileView";

export const metadata = {
  title: "My Profile — CoreStarter",
  description: "View authenticated user account details and permissions",
};

export default function ProfilePage() {
  return <MyProfileView />;
}
