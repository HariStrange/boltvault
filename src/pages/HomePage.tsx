import { Link, Navigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (token && user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'driver':
        return <Navigate to="/dashboard/driver" replace />;
      case 'welder':
        return <Navigate to="/dashboard/welder" replace />;
      case 'student':
        return <Navigate to="/dashboard/student" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-emerald-500/10">
            <Users className="w-20 h-20 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground">Driver Portal</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Manage your driver and welder operations with ease
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
