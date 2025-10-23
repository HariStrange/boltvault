import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WelderDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welder Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your welding projects and certifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Current welding assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Completed Jobs</CardTitle>
            <CardDescription>Jobs finished this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>Active certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
