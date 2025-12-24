import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusBadgeClass } from "@/lib/utils"; // Assuming this utility exists
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const notes = [
  {
    date: "2025-02-01",
    title: "Initial intake meeting",
    body: "Discussed housing challenges, school registration for children, and basic orientation to Calgary transit.",
  },
];

// -----------------------------------------------------------------------------
//                          SERVER ACTIONS
// -----------------------------------------------------------------------------

// The status remains 'Open' as requested.
export async function recommendClosureAction(caseId: string) {
    'use server'
    if (!caseId) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("cases")
      .update({ 
          end_date: new Date().toISOString() 
      }) 
      .eq("id", caseId);

    if (error) throw new Error(error.message);

    // Redirect to refresh the page and show the disabled button state
    redirect("/volunteer"); 
}

export async function acceptCaseAction(caseId: string) {
    'use server' 
    if (!caseId) return; 
    
    const supabase = createClient();

    // Status goes from Assigned -> Open
    const { error } = await supabase
      .from("cases")
      .update({ status: "Open" }) 
      .eq("id", caseId);

    if (error) throw new Error(error.message);

    redirect("/volunteer");
}


// -----------------------------------------------------------------------------
//                          MAIN VOLUNTEER DASHBOARD PAGE
// -----------------------------------------------------------------------------

export default async function VolunteerDashboardPage() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Check user role
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Redirect caseworkers to the caseworker page
    if (currentUser?.role && 
        (currentUser.role.toLowerCase().replace(/\s+/g, '') === 'caseworker' || 
         currentUser.role === 'CaseWorker')) {
      redirect("/caseworker");
    }

    const { data: caseRows, error: casesError } = await supabase
      .from("cases")
      .select(
        `id, title, status, start_date, end_date, created_at,
         caseworker:caseworker_id ( first_name, last_name )`
      )
      .eq("volunteer_id", user.id)
      .order("created_at", { ascending: false });

    if (casesError) {
      console.error("Error loading volunteer cases", casesError);
    }

    const { data: badges, error: badgesError } = await supabase
      .from("badges")
      .select("name, closed_cases_required");

    if (badgesError) {
      console.error("Error loading badges", badgesError);
    }

    const allCases = caseRows ?? [];
    const activeCases = allCases.filter(
      (c) => c.status === "Open" || c.status === "Assigned" || c.status === "In Progress"
    ).length;
    const closedCases = allCases.filter((c) => c.status === "Closed").length;

    const tableCases = allCases.map((c) => {
      const supervisor = c.caseworker
        ? `Sr. Caseworker: ${(c.caseworker as any).first_name} ${(c.caseworker as any).last_name}`
        : "—";
      
      const rawCaseId = c.id as string | null;

      return {
        id: rawCaseId?.slice(0, 8).toUpperCase() ?? "—", 
        rawId: rawCaseId, 
        family: (c.title as string | null) ?? "Untitled case",
        supervisor,
        startDate: (c.start_date as string | null) ?? "—",
        endDate: (c.end_date as string | null) ?? "—",
        status: (c.status as string | null) ?? "—",

        isRecommended: !!c.end_date, 
      };
    });

    const badgeProgress = (badges ?? []).map((badge) => ({
      name: (badge.name as string | null) ?? "Badge",
      required: (badge.closed_cases_required as number | null) ?? 0,
      current: closedCases,
    }));

    const nextBadgeText = (() => {
      if (!badges || badges.length === 0) return "—";
      const sorted = [...badges].sort(
        (a, b) => ((a.closed_cases_required ?? 0) - (b.closed_cases_required ?? 0))
      );
      const next = sorted.find((b) => (b.closed_cases_required ?? 0) > closedCases);
      if (!next) return "All badges earned";
      const remaining = (next.closed_cases_required ?? 0) - closedCases;
      return `${next.name ?? "Next badge"} (${remaining} more cases)`;
    })();

    return (
      <div className="bg-background_light py-10 md:py-16">
        <div className="container space-y-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-semibold text-text_primary md:text-4xl">
                Volunteer Dashboard
              </h1>
              <p className="text-sm text-text_muted">
                Your cases, your progress, your impact.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Active Cases
                  </CardDescription>
                  <CardTitle className="text-2xl text-text_primary">{activeCases}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Closed Cases
                  </CardDescription>
                  <CardTitle className="text-2xl text-text_primary">{closedCases}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/10 bg-white">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-text_muted">
                    Next Badge
                  </CardDescription>
                  <CardTitle className="text-base text-text_primary">
                    {nextBadgeText}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-primary/10 bg-white">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base text-text_primary">My Cases</CardTitle>
                  <CardDescription className="text-xs text-text_muted">
                    Overview of the families and individuals you are currently supporting.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto pt-0">
                {/* Responsive table structure */}
                <table className="w-full text-left text-xs text-text_muted table-auto sm:table-fixed">

                  <thead className="border-b text-[11px] uppercase">
                    <tr>
                      <th className="pb-2 pr-4 font-medium min-w-[80px]">Case ID</th>
                      <th className="pb-2 pr-4 font-medium min-w-[150px]">Family Case Title</th>
                      <th className="pb-2 pr-4 font-medium min-w-[150px]">Supervisor</th>
                      <th className="pb-2 pr-4 font-medium min-w-[10px]">Start Date</th>
                      <th className="pb-2 pr-4 font-medium min-w-[100px]">End Date</th>
                      <th className="pb-2 pr-4 font-medium min-w-[100px]">Status</th>
                      <th className="pb-2 font-medium min-w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle text-[11px]">
                    {tableCases.map((item) => (
                      <tr key={item.id} className="border-t">
                        {/* Case ID link */}
                        <td className="py-2 pr-4">
                          <Link href={`/volunteer/cases/${item.rawId}`} 
                          className="text-primary hover:underline">
                            
                            {item.id} {/* keep the short display ID */}
                          </Link>
                        </td>
                        {/* Family Case Title link */}
                        <td className="py-2 pr-4">
                          <Link 
                            href={`/volunteer/cases/${item.id}`}
                            className="text-text_primary hover:underline"
                          >
                            {item.family}
                          </Link>
                        </td>
                        {/* Supervisor */}
                        <td className="py-2 pr-4">{item.supervisor}</td>
                        {/* Start Date and End Date */}
                        <td className="py-2 pr-4">{item.startDate}</td>
                        <td className="py-2 pr-4">{item.endDate}</td>
                        {/* Status Badge */}
                        <td className="py-2 pr-4">
                          <span
                            className={
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium " +
                              getStatusBadgeClass(item.status)
                            }
                          >
                            {item.status}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-2">
                          {item.status === "Assigned" && (
                            <form action={acceptCaseAction.bind(null, item.rawId ?? "")}>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="text-[10px] h-6"
                                    aria-label="Accept Case"
                                >
                                    Accept Case
                                </Button>
                            </form>
                          )}

                          {item.status === "Open" && (
                            <form action={recommendClosureAction.bind(null, item.rawId ?? "")}>
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant={item.isRecommended ? "secondary" : "outline"}
                                    className="text-[10px] h-6"
                                    disabled={item.isRecommended}
                                    aria-label="Recommend Closure"
                                >
                                    {item.isRecommended ? "Recommendation Sent" : "Recommend Closure"}
                                </Button>
                            </form>
                          )}

                          {(item.status === "Closed" || item.status === "In Progress") && (
                            <span className="text-text_muted text-[10px]">
                              {item.status === "Closed" ? "Case Closed" : "Review Pending"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">Badge Progress</CardTitle>
                <CardDescription className="text-xs text-text_muted">
                  Every closed case brings you closer to your next badge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {badgeProgress.map((badge) => {
                  const percent = Math.min(100, (badge.current / badge.required) * 100);
                  const achieved = badge.current >= badge.required;
                  return (
                    <div key={badge.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-text_primary">{badge.name}</span>
                        <span className="text-text_muted">
                          {badge.current} / {badge.required} cases
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background_light">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${percent}%` }}
                        />
                        </div>
                      {achieved && (
                        <p className="text-[11px] text-primary">Badge achieved!</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
}
