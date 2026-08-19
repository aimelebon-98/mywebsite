import VendorDashboardLayoutClient from "@/components/vendor/VendorDashboardLayoutClient";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <VendorDashboardLayoutClient>{children}</VendorDashboardLayoutClient>;
}