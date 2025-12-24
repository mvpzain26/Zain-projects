"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type FormState = {
  success: boolean;
  error: string | null;
};

export async function addVolunteer(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = Math.random().toString(36).slice(-8); // Generate random password

  try {
    // Validate input
    if (!firstName || !lastName || !email) {
      return { success: false, error: "All fields are required" };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create authentication user" };
    }

    // Create user in users table
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: "Volunteer",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return { success: false, error: "Failed to create user record" };
    }

    // Create training record
    const { error: trainingError } = await supabase
      .from("volunteer_trainings")
      .insert({
        volunteer_id: authData.user.id,
        training_id: "f8832d51-18ed-4f4d-a4e6-c5dc8291f9b8",
        start_date: new Date().toISOString(),
        completed_date: null,
      });

    if (trainingError) {
      console.error("Training record error:", trainingError);
      return { success: false, error: "Failed to create training record" };
    }

    // Revalidate the volunteers list
    revalidatePath("/admin");
    
    return { success: true, error: null };

  } catch (error) {
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
}