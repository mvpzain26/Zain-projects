"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Volunteer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Get the user's role from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      if (userError) {
        throw userError;
      }

      console.log('Login successful, user role:', userData?.role);

      // Redirect based on the role from the database
      const userRole = userData?.role?.toLowerCase();
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'caseworker' || userRole === 'case worker') {
        router.push('/caseworker');
      } else {
        // Default to volunteer for any other role
        router.push('/volunteer');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background_light py-12 md:py-20">
      <div className="container flex justify-center">
        <Card className="w-full max-w-md border-primary/10 bg-white/95 shadow-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-text_primary">Welcome back.</CardTitle>
            <CardDescription className="text-sm text-text_muted">
              Choose your role and log in to continue supporting newcomers and refugees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-left text-sm">
                <label htmlFor="email" className="font-medium text-text_primary">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 text-left text-sm">
                <label htmlFor="password" className="font-medium text-text_primary">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 text-left text-sm">
                <label htmlFor="role" className="font-medium text-text_primary">
                  Role
                </label>
                <select
                  id="role"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-text_primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Caseworker">CaseWorker</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <div className="pt-2 space-y-3">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Log In"}
                </Button>
                <div className="flex items-center justify-between text-xs text-text_muted">
                  <Link href="/reset-password" className="hover:text-primary">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
