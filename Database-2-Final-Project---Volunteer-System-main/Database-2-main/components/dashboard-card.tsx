import { Users, CheckCircle, Clock, Award } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
};

const StatCard = ({ title, value, icon, trend, description }: StatCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`mt-1 flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
            <span className="ml-1 text-muted-foreground">vs last month</span>
          </div>
        )}
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export function VolunteerStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Volunteers"
        value="24"
        icon={<Users className="h-5 w-5" />}
        trend={{ value: '+12%', isPositive: true }}
      />
      <StatCard
        title="Cases This Month"
        value="48"
        icon={<CheckCircle className="h-5 w-5" />}
        trend={{ value: '+5%', isPositive: true }}
      />
      <StatCard
        title="Avg. Resolution Time"
        value="14 days"
        icon={<Clock className="h-5 w-5" />}
        trend={{ value: '-2 days', isPositive: true }}
      />
      <StatCard
        title="Badges Awarded"
        value="36"
        icon={<Award className="h-5 w-5" />}
        description="This year"
      />
    </div>
  );
}
