import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-destructive/10">
            <ShieldAlert className="w-20 h-20 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Unauthorized</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            You don't have permission to access this page
          </p>
        </div>

        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
