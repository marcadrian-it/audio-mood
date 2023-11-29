import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-screen relative text-white bg-[#0a0614]">
      <Sidebar />
      <div className="ml-[220px] h-full">
        <header className="h-[60px] border-b border-white/10">
          <div className="h-full w-full px-6 flex items-center justify-end">
            <UserButton />
          </div>
        </header>
        <div className="overflow-hidden h-[calc(100vh-60px)]">{children}</div>
      </div>
    </div>
  );
};
export default DashboardLayout;
