import { Award, Star, Shield, Heart } from 'lucide-react';

const BadgeIcon = ({ level }: { level: number }) => {
  switch (level) {
    case 1:
      return <Award className="h-8 w-8 text-badge-cornerstone" />;
    case 2:
      return <Star className="h-8 w-8 text-badge-bridge" />;
    case 3:
      return <Shield className="h-8 w-8 text-badge-beacon" />;
    default:
      return <Heart className="h-8 w-8 text-primary" />;
  }
};

type BadgeProps = {
  level: 1 | 2 | 3;
  title: string;
  description: string;
  progress: number;
  total: number;
};

export function BadgeCard({ level, title, description, progress, total }: BadgeProps) {
  const progressPercentage = (progress / total) * 100;
  const isComplete = progress >= total;
  
  const badgeColors = {
    1: 'border-badge-cornerstone/20 bg-badge-cornerstone/5',
    2: 'border-badge-bridge/20 bg-badge-bridge/5',
    3: 'border-badge-beacon/20 bg-badge-beacon/5',
  };
  
  const textColors = {
    1: 'text-badge-cornerstone',
    2: 'text-badge-bridge',
    3: 'text-badge-beacon',
  };

  return (
    <div className={`rounded-xl border p-6 ${badgeColors[level]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${textColors[level]} bg-white shadow-sm`}>
              <BadgeIcon level={level} />
            </div>
            <h3 className={`text-lg font-semibold ${textColors[level]}`}>{title}</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>Progress</span>
              <span>{progress} / {total} cases</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${textColors[level].replace('text-', 'bg-')} transition-all duration-500`}
                style={{ width: `${isComplete ? 100 : progressPercentage}%` }}
              />
            </div>
            {isComplete && (
              <div className="mt-2 text-sm font-medium text-green-600 flex items-center">
                <span className="mr-1">✓</span> Badge earned!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BadgeShowcase() {
  const badges: BadgeProps[] = [
    {
      level: 1,
      title: "Cornerstone Companion",
      description: "Awarded after helping 10 families settle in Calgary.",
      progress: 5,
      total: 10,
    },
    {
      level: 2,
      title: "Bridge Builder",
      description: "Awarded after helping 25 families settle in Calgary.",
      progress: 5,
      total: 25,
    },
    {
      level: 3,
      title: "Beacon of Hope",
      description: "Awarded after helping 50 families settle in Calgary.",
      progress: 5,
      total: 50,
    },
  ];

  return (
    <div className="space-y-6">
      {badges.map((badge, index) => (
        <BadgeCard key={index} {...badge} />
      ))}
    </div>
  );
}
