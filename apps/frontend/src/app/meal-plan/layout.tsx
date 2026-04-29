import { AppSidebar } from '@/components/app-sidebar';

export default function MealPlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
