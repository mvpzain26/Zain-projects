"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function markTrainingComplete(selectedUserIds: string[]) {
  const supabase = createClient();
  
  if (!selectedUserIds || selectedUserIds.length === 0) {
    return { 
      success: false, 
      error: "No volunteers selected" 
    };
  }

  try {
    const now = new Date().toISOString();
    
    // Update the completed_date for all selected users
    const { error } = await supabase
      .from('volunteer_trainings')
      .update({ 
        completed_date: now 
      })
      .in('userid', selectedUserIds)
      .is('completed_date', null); // Only update if completed_date is null

    if (error) {
      console.error("Error updating training records:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { 
      success: true, 
      count: selectedUserIds.length 
    };
    
  } catch (error) {
    console.error("Unexpected error in markTrainingComplete:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
}