import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppHomePage() {
  return (
    <div className="bg-background_light py-12 md:py-20">
      <div className="container flex justify-center">
        <Card className="w-full max-w-xl border-primary/10 bg-white/95">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-text_primary">Aspire Volunteer Badge System</CardTitle>
            <CardDescription className="text-sm text-text_muted">
              Choose how you would like to access the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            <Button asChild className="w-full">
              <Link href="/volunteer">Open Volunteer Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin">Open Admin Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
