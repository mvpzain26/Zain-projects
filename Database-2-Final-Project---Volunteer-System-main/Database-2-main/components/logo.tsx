import { BookOpen, HeartHandshake } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
        <HeartHandshake className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold">Aspire</span>
        <span className="text-xs text-muted-foreground">Volunteer Badge System</span>
      </div>
    </div>
  );
}

export function LogoIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
      <HeartHandshake className="h-6 w-6" />
    </div>
  );
}
