import { FamilySidebar } from '@/components/family/FamilySidebar';
import { FamilyMobileNav } from '@/components/family/FamilyMobileNav';

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-screen bg-canvas">
      <FamilySidebar />
      <FamilyMobileNav />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
