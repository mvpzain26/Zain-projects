import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type Volunteer = {
  first_name: string;
  last_name: string;
};

type Case = {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string | null;
  volunteer: Volunteer[] | null;
  caseworker: Volunteer[] | null;
};

export default async function AllCasesPage() {
  const supabase = createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get user role
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirect if not a caseworker
  if (currentUser?.role?.toLowerCase() !== 'caseworker') {
    redirect("/volunteer");
  }

  // Fetch all cases
  const { data: cases, error } = await supabase
    .from("cases")
    .select(`
      id, 
      title, 
      status, 
      start_date, 
      end_date, 
      volunteer:volunteer_id (first_name, last_name),
      caseworker:caseworker_id (first_name, last_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading cases:", error);
  }

  return (
    <div className="bg-background_light py-10 md:py-16">
      <div className="container space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="font-heading text-3xl font-semibold text-text_primary md:text-4xl">
              All Cases
            </h1>
            <p className="text-sm text-text_muted">
              View and manage all cases in the system.
            </p>
          </div>
          <Link href="/caseworker/cases/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Case
            </Button>
          </Link>
        </div>

        {/* Cases Table */}
        <Card className="border-primary/10 bg-white">
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-text_primary font-medium">Case Title</th>
                    <th className="text-left py-3 px-4 text-text_primary font-medium">Volunteer</th>
                    <th className="text-left py-3 px-4 text-text_primary font-medium">Caseworker</th>
                    <th className="text-left py-3 px-4 text-text_primary font-medium">Dates</th>
                    <th className="text-left py-3 px-4 text-text_primary font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases?.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link href={`/caseworker/cases/${c.id}`} className="text-primary hover:underline">
                          {c.title || 'Untitled Case'}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        {c.volunteer?.length > 0 ? `${c.volunteer[0].first_name} ${c.volunteer[0].last_name}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {c.caseworker?.length > 0 ? `${c.caseworker[0].first_name} ${c.caseworker[0].last_name}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div>Start: {new Date(c.start_date).toLocaleDateString()}</div>
                        {c.end_date && <div className="text-sm text-text_muted">End: {new Date(c.end_date).toLocaleDateString()}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                          c.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!cases || cases.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text_muted">
                        No cases found
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
