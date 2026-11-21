import { LocationListView } from "@/modules/locations";

export const metadata = {
  title: "Work Locations & Geofences — Nasaq",
  description: "Configure physical work sites, GPS coordinates, and geofence boundaries",
};

export default function LocationsPage() {
  return <LocationListView />;
}
