import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const metadata: Metadata = {
  title: "NexCart Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 min-h-screen">
      <div className="flex">
        <AdminSidebar />
        <div className="min-h-screen flex-1">
          <AdminTopbar />
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
