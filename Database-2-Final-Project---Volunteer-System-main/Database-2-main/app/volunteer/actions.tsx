'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function recommendClosureAction(caseId: string) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("cases")
      .update({ 
          end_date: new Date().toISOString() 
      }) 
      .eq("id", caseId);

    if (error) {
      console.error("Error recommending closure:", error);
      throw new Error("Failed to recommend closure.");
    }

    // Redirect to refresh the case detail page and show the updated button state
    redirect(`/volunteer/cases/${caseId}`); 
}

export async function addActivityAction(formData: FormData) {
    const caseId = formData.get('caseId') as string;
    const type = formData.get('type') as string;
    const body = formData.get('body') as string;
    
    // Fetch user ID from session
    const { data: { user } } = await createClient().auth.getUser();
    const userId = user?.id;
    
    if (!caseId || !type || !body || !userId) {
        console.error("Missing required data for activity log or user not authenticated.");
        throw new Error("Missing required data or authentication failure.");
    }

    const { error } = await createClient()
      .from("activities")
      .insert({
        // Assuming Supabase columns are case_id, type, body, user_id, added_by_role
          case_id: caseId,
          type: type,
          body: body,
          user_id: userId,
          added_by_role: 'Volunteer' // Static for this page context
      });

    if (error) {
      console.error("Error adding activity:", error);
      throw new Error("Failed to log activity.");
    }

    // Redirect to refresh the case detail page and show the new activity
    redirect(`/volunteer/cases/${caseId}`); 
}