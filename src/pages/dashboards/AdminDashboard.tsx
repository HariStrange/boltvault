import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the admin control panel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Currently logged in users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Overall system health</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">Healthy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
