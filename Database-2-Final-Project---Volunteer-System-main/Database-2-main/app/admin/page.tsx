// Core UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import { CheckCircle } from "lucide-react";

// Navigation
import Link from "next/link";
import { redirect } from "next/navigation";

// Supabase Client
import { createClient } from "@/lib/supabase/server";

// Mock data for cases (will be replaced with actual data from Supabase)
const cases = [
  // [caseId, familyName, volunteer, caseworker, status, startDate, endDate]
  ["C-204", "Rahman Family", "M. Ali", "A. Khan", "Open", "2025-01-26", "2025-02-10"],
  ["C-205", "Al-Farooq Family", "S. Ahmed", "A. Khan", "Closed", "2025-02-01", "2025-02-11"],
  ["C-190", "Nguyen Family", "R. Chen", "S. Patel", "Closed", "2024-12-10", "2025-01-15"],
];

// Mock data for volunteers (will be replaced with actual data from Supabase)
const volunteers = [
  // [name, trainingComplete, activeCases, closedCases, badgesEarned, nextBadge]
  ["Sarah Ahmed", "Yes", "2", "18", "Cornerstone Companion", "Bridge Builder (2 more cases)"],
  ["Omar Hassan", "Yes", "3", "30", "Cornerstone, Bridge", "Beacon of Hope (0 more cases)"],
];

// Mock data for payouts (will be replaced with actual data from Supabase)
const payouts = [
  // [volunteerName, badgeAwarded, date, amount, status]
  ["Omar Hassan", "Beacon of Hope", "2025-03-12", "$75", "Pending"],
  ["Sarah Ahmed", "Bridge Builder", "2025-02-28", "$50", "Paid"],
];

// Quick action items for the admin dashboard
const quickActions = [
  {
    title: "Add new volunteer",
    description: "Create a volunteer account and link them to a senior caseworker.",
    cta: "Add Volunteer",
    href: "/admin/add-volunteer"
  },
  {
    title: "Mark training as complete",
    description: "Update volunteers who have completed the 3-day training so they can receive case assignments.",
    cta: "Update Training",
    href: "/admin/mark-training-complete"
  },
  {
    title: "Review closure recommendations",
    description: "See a queue of cases where volunteers have recommended closure and are waiting for senior caseworker review.",
    cta: "Review Cases",
    href: "#" // TODO: Update this when implementing the feature
  },
];

/**
 * Determines the next badge a volunteer can earn based on their closed case count
 * @param closedCount - Number of cases the volunteer has closed
 * @param badges - Array of badge objects with name and closed_cases_required
 * @returns Formatted string indicating the next badge and cases needed
 */
function getNextBadgeText(
  closedCount: number,
  badges: { name: string | null; closed_cases_required: number | null }[] | null
): string {
  if (!badges || badges.length === 0) return "—";
  
  // Sort badges by number of cases required (ascending)
  const sorted = [...badges].sort(
    (a, b) => (a.closed_cases_required ?? 0) - (b.closed_cases_required ?? 0)
  );
  
  // Find the first badge that requires more cases than the volunteer has closed
  const next = sorted.find((b) => (b.closed_cases_required ?? 0) > closedCount);
  
  if (!next) return "All badges earned";
  
  // Calculate remaining cases needed for next badge
  const remaining = (next.closed_cases_required ?? 0) - closedCount;
  return `${next.name ?? "Next badge"} (${remaining} more cases)`;
}

/**
 * Admin Dashboard Page
 * 
 * Main dashboard for administrators to manage volunteers, cases, and view analytics.
 * Displays key metrics, recent activities, and provides quick access to common actions.
 * 
 * @param searchParams - URL search parameters for handling success/error messages
 */
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Initialize Supabase client
  const supabase = createClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Verify user has admin role
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirect to volunteer dashboard if not an admin
  if (currentUser?.role !== "Admin") {
    redirect("/volunteer");
  }

  // Fetch all cases with related volunteer and caseworker information
  const { data: caseRows, error: casesError } = await supabase
    .from("cases")
    .select(
      `id, title, status, start_date, end_date, created_at,
       volunteer:volunteer_id ( first_name, last_name ),
       caseworker:caseworker_id ( first_name, last_name )`
    )
    .order("created_at", { ascending: false });

  // Log any errors that occur while fetching cases
  if (casesError) {
    console.error("Error loading cases", casesError);
  }

  // Fetch volunteer badges with related volunteer and badge information
  const { data: volunteerBadgeRows, error: volunteerBadgesError } = await supabase
    .from("volunteer_badges")
    .select(
      `id, award_date, award_sent,
       volunteer:volunteer_id ( id, first_name, last_name ),
       badge:badge_id ( name, reward_amount, closed_cases_required )`
    )
    .order("award_date", { ascending: false });

  // Handle errors for volunteer badges fetch
  if (volunteerBadgesError) {
    console.error("Error loading volunteer badges", volunteerBadgesError);
  }

  // Fetch all volunteer users
  const { data: volunteerUsers, error: usersError } = await supabase
    .from("users")
    .select("id, first_name, last_name, role, created_at")
    .eq("role", "Volunteer");

  // Handle errors for users fetch
  if (usersError) {
    console.error("Error loading users", usersError);
  }

  // Fetch volunteer training completion data
  const { data: trainings, error: trainingsError } = await supabase
    .from("volunteer_trainings")
    .select("volunteer_id, completed_date");

  // Handle errors for trainings fetch
  if (trainingsError) {
    console.error("Error loading trainings", trainingsError);
  }

  // Fetch available badges with their requirements and rewards
  const { data: badges, error: badgesError } = await supabase
    .from("badges")
    .select("name, closed_cases_required, reward_amount");

  // Handle errors for badges fetch
  if (badgesError) {
    console.error("Error loading badges", badgesError);
  }

  // Transform case data for display in the UI
  const cases = (caseRows ?? []).map((c) => {
    // Format case ID (first 8 characters in uppercase)
    const caseIdShort = (c.id as string | null)?.slice(0, 8).toUpperCase() ?? "—";
    
    // Format volunteer name or show placeholder
    const volunteerName = c.volunteer
      ? `${(c.volunteer as any).first_name} ${(c.volunteer as any).last_name}`
      : "—";
      
    // Format caseworker name or show placeholder
    const caseworkerName = c.caseworker
      ? `${(c.caseworker as any).first_name} ${(c.caseworker as any).last_name}`
      : "—";

    return [
      caseIdShort,
      (c.title as string | null) ?? "Untitled case",
      volunteerName,
      caseworkerName,
      (c.status as string | null) ?? "—",
      (c.start_date as string | null) ?? "—",
      (c.end_date as string | null) ?? "—",
    ];
  });

  // Transform volunteer badge data into payout information
  const payouts = (volunteerBadgeRows ?? []).map((vb) => {
    const volunteer = vb.volunteer as any | null;
    const badge = vb.badge as any | null;

    // Format volunteer name or show placeholder
    const volunteerName = volunteer
      ? `${volunteer.first_name} ${volunteer.last_name}`
      : "Unknown";

    // Format reward amount with currency symbol
    const rewardAmount = badge?.reward_amount != null ? `$${badge.reward_amount}` : "—";

    return [
      volunteerName,
      (badge?.name as string | null) ?? "Badge",
      (vb.award_date as string | null) ?? "—",
      rewardAmount,
      vb.award_sent ? "Paid" : "Pending",
    ];
  });

  // Calculate case statistics per volunteer
  const caseStats = new Map<string, { active: number; closed: number }>();
  
  // Count active and closed cases for each volunteer
  for (const c of caseRows ?? []) {
    const volunteer = (c.volunteer as any | null) ?? null;
    if (!volunteer?.id) continue;
    
    const key = volunteer.id as string;
    const current = caseStats.get(key) ?? { active: 0, closed: 0 };
    
    // Update counts based on case status
    if (c.status === "Closed") {
      current.closed += 1;
    } else if (c.status === "Open") {
      current.active += 1;
    }
    
    caseStats.set(key, current);
  }

  // Create a set of volunteer IDs who have completed training
  const trainingComplete = new Set<string>();
  for (const t of trainings ?? []) {
    // Add volunteer to the set if they have a completion date
    if (t.completed_date && t.volunteer_id) {
      trainingComplete.add(t.volunteer_id as string);
    }
  }

  // Organize badges by volunteer ID for quick lookup
  const badgesByVolunteer = new Map<string, string[]>();
  
  // Group badges by volunteer
  for (const vb of volunteerBadgeRows ?? []) {
    const volunteer = vb.volunteer as any | null;
    const badge = vb.badge as any | null;
    if (!volunteer?.id || !badge?.name) continue;
    const list = badgesByVolunteer.get(volunteer.id as string) ?? [];
    list.push(badge.name as string);
    badgesByVolunteer.set(volunteer.id as string, list);
  }

  const volunteers = (volunteerUsers ?? []).map((v) => {
    const id = v.id as string;
    const stats = caseStats.get(id) ?? { active: 0, closed: 0 };
    const badgeNames = badgesByVolunteer.get(id) ?? [];
    const trainingDone = trainingComplete.has(id) ? "Yes" : "No";

    const nextBadge = getNextBadgeText(stats.closed, badges ?? []);

    return [
      `${v.first_name} ${v.last_name}`,
      trainingDone,
      String(stats.active),
      String(stats.closed),
      badgeNames.length ? badgeNames.join(", ") : "—",
      nextBadge,
    ];
  });

  const successMessage = searchParams.success as string | undefined;

  return (
    <div className="flex flex-col min-h-screen">
      {successMessage && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="bg-background_light py-10 md:py-16">
        <div className="container space-y-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-semibold text-text_primary md:text-4xl">
                Admin Dashboard
              </h1>
              <p className="text-sm text-text_muted">
                Oversee cases, track performance, and celebrate your volunteers.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Open Cases
                  </CardDescription>
                  <CardTitle className="text-2xl text-text_primary">
                    {(caseRows ?? []).filter(c => (c.status as string) === 'Open').length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Closed Cases
                  </CardDescription>
                  <CardTitle className="text-2xl text-text_primary">
                    {(caseRows ?? []).filter(c => (c.status as string) === 'Closed').length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Active Volunteers
                  </CardDescription>
                  <CardTitle className="text-2xl text-text_primary">
                    {volunteerUsers?.length || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Badges Awarded
                  </CardDescription>
                  <CardTitle className="text-2xl text-text_primary">
                    {volunteerBadgeRows?.length || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">Case Overview</CardTitle>
                <CardDescription className="text-xs text-text_muted">
                  Quickly see how many cases are assigned, open, or closed, and which senior caseworkers are managing
                  them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex gap-4 text-xs text-text_primary">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-status_open" /> Open
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-status_closed" /> Closed
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl bg-background_light p-4">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b text-[11px] uppercase">
                      <tr>
                        <th className="pb-2 pr-3 font-medium text-text_primary">Case ID</th>
                        <th className="pb-2 pr-3 font-medium text-text_primary">Family Title</th>
                        <th className="pb-2 pr-3 font-medium text-text_primary">Volunteer</th>
                        <th className="pb-2 pr-3 font-medium text-text_primary">CaseWorker</th>
                        <th className="pb-2 pr-3 font-medium text-text_primary">Status</th>
                        <th className="pb-2 pr-3 font-medium text-text_primary">Start Date</th>
                        <th className="pb-2 font-medium text-text_primary">Last Update</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle text-[11px]">
                      {cases.map((row) => (
                        <tr key={row[0]} className="border-t">
                          {row.map((cell, idx) => (
                            <td
                              key={idx}
                              className={`py-2 ${idx < row.length - 1 ? "pr-3" : ""} text-text_primary`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">Badge Rewards Summary</CardTitle>
                <CardDescription className="text-xs text-text_muted">
                  Track which volunteers have earned badges and appreciation amounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto pt-0">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b text-[11px] uppercase">
                    <tr>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Volunteer</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Badge</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Date Earned</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Reward Amount</th>
                      <th className="pb-2 font-medium text-text_primary">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle text-[11px]">
                    {payouts.map((row) => (
                      <tr key={`${row[0]}-${row[1]}`} className="border-t">
                        {row.map((cell, idx) => (
                          <td
                            key={idx}
                            className={`py-2 ${idx < row.length - 1 ? "pr-3" : ""} text-text_primary`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">Volunteer Performance &amp; Badges</CardTitle>
                <CardDescription className="text-xs text-text_muted">
                  View how many cases each volunteer has closed and which badges they have unlocked.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto pt-0">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b text-[11px] uppercase">
                    <tr>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Volunteer Name</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Training Complete</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Active Cases</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Closed Cases</th>
                      <th className="pb-2 pr-3 font-medium text-text_primary">Badges Earned</th>
                      <th className="pb-2 font-medium text-text_primary">Next Badge</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle text-[11px]">
                    {volunteers.map((row) => (
                      <tr key={row[0]} className="border-t">
                        {row.map((cell, idx) => (
                          <td
                            key={idx}
                            className={`py-2 ${idx < row.length - 1 ? "pr-3" : ""} text-text_primary`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">Quick Admin Actions</CardTitle>
                <CardDescription className="text-xs text-text_muted">
                  Shortcuts to common workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {[
                  {
                    title: "Add new volunteer",
                    description: "Create a volunteer account and link them to a senior caseworker.",
                    cta: "Add Volunteer",
                    href: "/admin/add-volunteer",
                  },
                  {
                    title: "Mark training as complete",
                    description:
                      "Update volunteers who have completed the 3-day training so they can receive case assignments.",
                    cta: "Update Training",
                    href: "/admin/mark-training-complete",
                  },
                  {
                    title: "Review closure recommendations",
                    description:
                      "See a queue of cases where volunteers have recommended closure and are waiting for senior caseworker review.",
                    cta: "Review Cases",
                    href: "/admin/review-closures",
                  },
                ].map((action) => (
                  <Card key={action.title} className="flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <div className="mt-auto px-6 pb-6">
                      <Link href={action.href} className="w-full">
                        <Button className="w-full">{action.cta}</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
            </section>
        </div>
      </div>
    </div>
  );
}
