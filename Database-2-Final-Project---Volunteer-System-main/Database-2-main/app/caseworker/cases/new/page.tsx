import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define a type for the volunteers we fetch
type VolunteerOption = {
  id: string;
  first_name: string;
  last_name: string;
};

// --- SERVER ACTION: Handles Case Creation ---
async function createCase(formData: FormData) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Authentication failed: User not found.");
    redirect('/login');
  }
  
  // Caseworker ID is a UUID string
  const caseworkerId = user.id; 

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  
  // Volunteer ID is a UUID string from the select box
  const volunteerId = formData.get('volunteerId') as string;
  const startDate = formData.get('startDate') as string;
  
  // Re-run validation with corrected variables
  if (!title || !description || !startDate || !volunteerId) {
    console.error("Validation Error: Missing required form fields (Title, Description, Start Date, or Volunteer).");
    return;
  }

  // NOTE: Given the UUID fields in the cases table, the error is occurring 
  // in an auxiliary database trigger/function that runs during this INSERT
  // and is attempting to log the user's UUID into an INTEGER column of 
  // a different table (e.g., an audit log).
  const casePayload = {
      title: title,
      description: description,
      start_date: startDate,
      volunteer_id: volunteerId, // UUID string
      caseworker_id: caseworkerId, // UUID string
      status: 'Open', // Initial status
      created_at: new Date().toISOString(),
  };

  console.log("Attempting to insert new case with payload:", casePayload);
  
  const { error } = await supabase
    .from('cases')
    .insert(casePayload);

  if (error) {
    console.error("Database INSERT Error creating case:", error.message);
    console.error("Database Error Details:", error);
    return;
  }

  console.log("Case created successfully. Redirecting...");
  // Redirect back to the dashboard upon successful creation
  redirect('/caseworker');
}

// --- PAGE COMPONENT ---
export default async function NewCasePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Fetch all users with the role 'volunteer'
  const { data: volunteers, error } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .eq("role", "Volunteer") // Note: Role is now capitalized "Volunteer"
    .order("last_name", { ascending: true }) as { data: VolunteerOption[] | null, error: any };

  if (error) {
    console.error("Error fetching volunteers:", error);
    // Handle error case, perhaps by allowing the user to continue without assigning a volunteer initially
  }

  return (
    <div className="bg-background_light py-10 md:py-16">
      <div className="container max-w-2xl">
        <div className="space-y-1 mb-8">
          <h1 className="font-heading text-3xl font-semibold text-text_primary md:text-4xl">
            Create New Case
          </h1>
          <p className="text-sm text-text_muted">
            Fill in the details below to open a new case and assign a volunteer.
          </p>
        </div>

        <Card className="border-primary/10 bg-white">
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 2. Use the Server Action in the form */}
            
            <form action={createCase} className="space-y-6">
              
              {/* Case Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title</Label>
                <Input id="title" name="title" required placeholder="e.g., Support for newcommer family 5" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Case Description</Label>
                <Textarea id="description" name="description" required rows={5} placeholder="Provide details about the client's needs and current situation." />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                {/* Use type="date" for native date picker */}
                <Input id="startDate" name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Volunteer Assignment */}
              <div className="space-y-2">
                <Label htmlFor="volunteerId">Assign Volunteer</Label>
                
                <select 
                    id="volunteerId" 
                    name="volunteerId" 
                    required 
                    aria-label="Select Volunteer"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="" disabled>Select a Volunteer</option>
                    {volunteers && volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.first_name} {v.last_name}
                        </option>
                    ))}
                    {(!volunteers || volunteers.length === 0) && (
                        <option value="" disabled>No volunteers available</option>
                    )}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" /> Create Case
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}