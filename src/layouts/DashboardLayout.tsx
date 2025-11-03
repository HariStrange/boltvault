import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
