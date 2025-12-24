import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr'; 

// Exporting the GET function for the Route Handler
export async function GET() {
  const cookieStore = cookies();
  
  // Create a Supabase client that can read/write cookies for authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Or use the Service Role Key if needed, but ANON is usually sufficient for auth checks
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options: any) => {
          cookieStore.set(name, '', options);
        },
      },
    }
  );
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Get the user's role from the users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error("Error fetching user role in API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  
  return NextResponse.json({
    userId: user.id,
    email: user.email,
    role: userData?.role
  });
}