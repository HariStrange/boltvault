import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DriverDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your driver activities and tasks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
            <CardDescription>Your assigned routes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
            <CardDescription>Tasks finished today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Hours Worked</CardTitle>
            <CardDescription>Total hours this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0h</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
