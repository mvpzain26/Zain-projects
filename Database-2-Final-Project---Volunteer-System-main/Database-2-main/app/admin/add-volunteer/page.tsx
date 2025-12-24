"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addVolunteer } from "./actions";
import Link from "next/link";

type FormState = {
  success: boolean;
  error: string | null;
};

export default function AddVolunteerPage() {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>({ success: false, error: null });
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addVolunteer(formState, formData);
      setFormState(result);
      if (result.success) {
        // Reset form on success
        const form = document.getElementById('volunteer-form') as HTMLFormElement;
        if (form) form.reset();
      }
    });
  }

  // Reset form after successful submission
  if (formState?.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Add New Volunteer</h1>
        </div>
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Success!</h2>
          <p className="text-green-700 mb-4">Volunteer has been added successfully.</p>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link href="/admin">Back to Admin</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setFormKey(prev => prev + 1);
                setFormState({ success: false, error: null });
              }}
            >
              Add Another Volunteer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Volunteer</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new volunteer
        </p>
      </div>

      {formState?.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {formState.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Volunteer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            key={formKey} 
            id="volunteer-form"
            action={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                disabled={formState?.success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                disabled={formState?.success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={formState?.success}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" asChild>
                <Link href="/admin">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Volunteer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}