"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Volunteer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      setError("Unable to complete registration. Please check your email and try again.");
      return;
    }

    const { error: profileError } = await supabase.from("users").insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    // Normalize the role for consistent storage
    const normalizedRole = role.toLowerCase().replace(/\s+/g, '');
    
    // Redirect based on role
    if (normalizedRole === 'admin') {
      router.push("/admin");
    } else if (normalizedRole === 'caseworker') {
      router.push("/caseworker");
    } else {
      router.push("/volunteer");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background_light py-12 md:py-20">
      <div className="container flex justify-center">
        <Card className="w-full max-w-md border-primary/10 bg-white/95">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-text_primary">Create an account</CardTitle>
            <CardDescription className="text-sm text-text_muted">
              Sign up to access the volunteer or admin dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 text-left text-sm">
                  <label htmlFor="first-name" className="font-medium text-text_primary">
                    First name
                  </label>
                  <Input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1 text-left text-sm">
                  <label htmlFor="last-name" className="font-medium text-text_primary">
                    Last name
                  </label>
                  <Input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left text-sm">
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

              <div className="space-y-1 text-left text-sm">
                <label htmlFor="password" className="font-medium text-text_primary">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 text-left text-sm">
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
                  <option value="CaseWorker">CaseWorker</option>
                  <option value="Admin">Admin</option>
                </select>
                <p className="text-xs text-text_muted mt-1">
                  Select your role (CaseWorker requires admin approval)
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <div className="space-y-3 pt-2">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
                <p className="text-center text-xs text-text_muted">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
