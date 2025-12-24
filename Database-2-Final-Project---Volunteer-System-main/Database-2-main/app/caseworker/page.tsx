import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, XCircle, CheckCircle, Clock } from "lucide-react";
import { getStatusBadgeClass } from "@/lib/utils"; 
import Link from "next/link";
import { revalidatePath } from "next/cache"; 

type UserProfile = {
    first_name: string;
    last_name: string;
};

type Case = {
    id: string;
    title: string;
    status: string;
    start_date: string;
    end_date: string | null;
    volunteer: UserProfile | null;
    caseworker: UserProfile | null;
};

// -----------------------------------------------------------------------------
//                          SERVER ACTIONS
// -----------------------------------------------------------------------------

export async function closeCaseAction(caseId: string) {
    'use server'
    if (!caseId) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("cases")
      .update({ 
          status: "Closed", 
          end_date: new Date().toISOString() // Set end_date to current date
      }) 
      .eq("id", caseId);

    if (error) throw new Error(error.message);

    // Revalidate the dashboard page to show the updated case list immediately
    revalidatePath("/caseworker");
}


// -----------------------------------------------------------------------------
//                          MAIN CASEWORKER DASHBOARD PAGE
// -----------------------------------------------------------------------------

export default async function CaseworkerDashboardPage() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Get user role and ensure they are a caseworker
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("role, first_name, last_name") 
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
      redirect("/volunteer"); 
    }

    const normalizedRole = currentUser.role?.toLowerCase().replace(/\s+/g, '');
    
    // Enforce Caseworker Role
    if (normalizedRole !== 'caseworker') {
      redirect("/volunteer");
    }
    
    const caseworkerId = user.id;

    // Fetch Only Their Cases & Review Recommended Closures
    const { data: rawCases, error } = await supabase 
      .from("cases")
      .select(`
        id, 
        title, 
        status, 
        start_date, 
        end_date, 
        volunteer:volunteer_id (first_name, last_name),
        caseworker_id 
      `) 
      .eq('caseworker_id', caseworkerId) // ENSURES ONLY THEIR CASES ARE FETCHED
      .order("end_date", { ascending: false, nullsFirst: false }); // Sort by end_date for closed cases

    const cases = rawCases as Case[] | null;

    if (error) {
      console.error("Error loading cases:", error);
    }

    // --- Data Filtering ---
    const activeCasesList = cases?.filter(c => c.status === 'Open' && c.end_date === null) || [];
    const recommendedClosureList = cases?.filter(c => c.status === 'Open' && c.end_date !== null) || [];
    const closedCasesList = cases?.filter(c => c.status === 'Closed') || [];
    
    const activeCasesCount = activeCasesList.length;
    const recommendedClosureCount = recommendedClosureList.length;
    const closedCasesCount = closedCasesList.length;
    const totalCases = (cases?.length || 0);
    const caseworkerFullName = `${currentUser?.first_name || ''} ${currentUser?.last_name || 'Caseworker'}`;

    return (
      <div className="bg-background_light py-10 md:py-16">
        <div className="container space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-semibold text-text_primary md:text-4xl">
                Caseworker Dashboard
              </h1>
              <p className="text-sm text-text_muted">
                {caseworkerFullName} managing {totalCases} total cases.
              </p>
            </div>
            {/* “New Case” Button Redirects */}
            <Link href="/caseworker/cases/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Case
              </Button>
            </Link>
          </div>

          {/* Stats Cards (Now reflect only the caseworker's cases) */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-primary/10 bg-white">
              <CardHeader className="pb-2">
                <p className="text-xs uppercase tracking-wide text-text_muted">Active Cases</p>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{activeCasesCount}</div>
              </CardContent>
            </Card>
            
            {/* Recommended Closure Cases (New Stat Card) */}
            <Card className="border-amber-400/50 bg-amber-50">
              <CardHeader className="pb-2">
                <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4"/> CLOSURE REVIEW
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">{recommendedClosureCount}</div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/10 bg-white">
              <CardHeader className="pb-2">
                <p className="text-xs uppercase tracking-wide text-text_muted">Closed Cases</p>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{closedCasesCount}</div>
              </CardContent>
            </Card>
            <Card className="border-primary/10 bg-white">
              <CardHeader className="pb-2">
                <p className="text-xs uppercase tracking-wide text-text_muted">Total Cases</p>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCases}</div>
              </CardContent>
            </Card>
          </div>

          {/* --- CARD 1: Recommended for Closure --- */}
          {recommendedClosureCount > 0 && (
            <Card className="border-amber-400/50 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5"/> Cases Recommended for Closure ({recommendedClosureCount})
                </CardTitle>
                <CardDescription className="text-amber-600">
                    Review these cases recommended for closure by your assigned volunteers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-300/50">
                        <th className="text-left py-3 px-4 text-amber-700 font-medium">Case Title</th>
                        <th className="text-left py-3 px-4 text-amber-700 font-medium">Volunteer</th>
                        <th className="text-left py-3 px-4 text-amber-700 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendedClosureList.map((c) => (
                        <tr key={c.id} className="border-b border-amber-200 hover:bg-amber-100/70">
                          <td className="py-3 px-4">
                            <Link href={`/caseworker/cases/${c.id}`} className="text-amber-700 hover:underline font-medium">
                              {c.title || 'Untitled Case'}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-amber-700">
                            {c.volunteer ? `${c.volunteer.first_name} ${c.volunteer.last_name}` : '—'}
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            {/* Form for the closeCaseAction */}
                            <form action={closeCaseAction.bind(null, c.id)}>
                                <Button size="sm" type="submit" className="bg-green-600 hover:bg-green-700 text-white h-8">
                                    <CheckCircle className="h-4 w-4 mr-1" /> Final Close
                                </Button>
                            </form>
                            {/* Link to view case before closing */}
                            <Link href={`/caseworker/cases/${c.id}`}>
                                <Button variant="outline" size="sm" className="h-8">
                                    Review
                                </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <hr/>

          {/* --- CARD 2: Active Caseload --- */}
          <Card className="border-primary/10 bg-white">
            <CardHeader>
              <CardTitle>Active Caseload ({activeCasesCount})</CardTitle>
              <CardDescription className="text-sm text-text_muted">
                Cases currently in progress by your volunteers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Case Title</th>
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Volunteer</th>
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Display only truly active cases */}
                    {activeCasesList.map((c) => (
                      <tr 
                          key={c.id} 
                          className={`border-b hover:bg-gray-50`}
                      >
                        <td className="py-3 px-4">
                          <Link href={`/caseworker/cases/${c.id}`} className="text-primary hover:underline font-medium">
                            {c.title || 'Untitled Case'}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          {c.volunteer ? `${c.volunteer.first_name} ${c.volunteer.last_name}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                            <Link href={`/caseworker/cases/${c.id}`} className="inline-flex items-center justify-center">
                                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                        <path d="M2 12s3-7.5 10-7.5 10 7.5 10 7.5-3 7.5-10 7.5S2 12 2 12Z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span>View Details</span>
                                </Button>
                            </Link>
                        </td>
                      </tr>
                    ))}
                    {(activeCasesList.length === 0 && recommendedClosureCount === 0 && closedCasesCount === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-text_muted">
                          No active cases found assigned to you.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <hr/>

          {/* --- NEW CARD: Closed Cases --- */}
          <Card className="border-green-400/50 bg-white">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5"/> Closed Cases ({closedCasesCount})
              </CardTitle>
              <CardDescription className="text-sm text-text_muted">
                Completed cases managed by you and your volunteers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Case Title</th>
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Volunteer</th>
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Closed Date</th>
                      <th className="text-left py-3 px-4 text-text_primary font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Display closed cases */}
                    {closedCasesList.map((c) => (
                      <tr key={c.id} className={`border-b hover:bg-gray-50`}>
                        <td className="py-3 px-4">
                          <Link href={`/caseworker/cases/${c.id}`} className="text-primary hover:underline font-medium">
                            {c.title || 'Untitled Case'}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          {c.volunteer ? `${c.volunteer.first_name} ${c.volunteer.last_name}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {c.end_date ? new Date(c.end_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                            <Link href={`/caseworker/cases/${c.id}`}>
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-gray-100">
                                    View Details
                                </Button>
                            </Link>
                        </td>
                      </tr>
                    ))}
                    {closedCasesList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-text_muted">
                          No closed cases found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    );
}