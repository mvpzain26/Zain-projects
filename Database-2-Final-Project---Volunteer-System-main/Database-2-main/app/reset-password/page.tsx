import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background_light py-12 md:py-20">
      <div className="container flex justify-center">
        <Card className="w-full max-w-md border-primary/10 bg-white/95">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-text_primary">Reset password</CardTitle>
            <CardDescription className="text-sm text-text_muted">
              Enter the email associated with your volunteer account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left text-sm">
              <label htmlFor="email" className="font-medium text-text_primary">
                Email
              </label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <Button className="w-full">Send reset link</Button>
            <p className="text-center text-xs text-text_muted">
              <Link href="/login" className="hover:text-primary">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
