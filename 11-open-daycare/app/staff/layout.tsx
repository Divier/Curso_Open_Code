import { StaffSidebar } from '@/components/staff/StaffSidebar';
import { StaffMobileNav } from '@/components/staff/StaffMobileNav';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-screen bg-canvas">
      <StaffSidebar />
      <StaffMobileNav />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
