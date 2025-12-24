"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type Volunteer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  training?: {
    id: string;
    volunteer_id: string;
    training_id: string;
    start_date: string;
    completed_date: string | null;
  } | null;
};

export default function MarkTrainingCompletePage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<string>>(new Set());

  const supabase = createClient();

  const fetchVolunteers = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('volunteer_trainings')
        .select(`
          id,
          volunteer_id,
          training_id,
          start_date,
          completed_date,
          users!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .is('completed_date', null)
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Volunteer type
      const formattedVolunteers = data.map((training: any) => ({
        id: training.users.id,
        first_name: training.users.first_name,
        last_name: training.users.last_name,
        email: training.users.email,
        training: {
          id: training.id,
          volunteer_id: training.volunteer_id,
          training_id: training.training_id,
          start_date: training.start_date,
          completed_date: training.completed_date
        }
      }));

      setVolunteers(formattedVolunteers);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setError("Failed to load volunteers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const toggleVolunteerSelection = (volunteerId: string) => {
    const newSelection = new Set(selectedVolunteers);
    if (newSelection.has(volunteerId)) {
      newSelection.delete(volunteerId);
    } else {
      newSelection.add(volunteerId);
    }
    setSelectedVolunteers(newSelection);
  };

  const handleFinishTraining = async () => {
    if (selectedVolunteers.size === 0) {
      setError("Please select at least one volunteer");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('volunteer_trainings')
        .update({ 
          completed_date: new Date().toISOString() 
        })
        .in('id', Array.from(selectedVolunteers).map(id => 
          volunteers.find(v => v.training?.id === id)?.training?.id
        ).filter(Boolean) as string[]);

      if (error) throw error;

      setSuccess(`Successfully marked training as complete for ${selectedVolunteers.size} volunteer(s)`);
      setSelectedVolunteers(new Set());
      fetchVolunteers(); // Refresh the list
    } catch (err) {
      console.error("Error updating training status:", err);
      setError("Failed to update training status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading volunteers...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mark Training as Complete</h1>
        <p className="text-muted-foreground">
          Select volunteers who have completed their training
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Volunteers in Training</CardTitle>
            <p className="text-sm text-muted-foreground">
              {volunteers.length} volunteer(s) currently in training
            </p>
          </div>
          <Button 
            onClick={handleFinishTraining}
            disabled={selectedVolunteers.size === 0 || loading}
          >
            {loading ? 'Processing...' : `Complete Training (${selectedVolunteers.size})`}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No volunteers currently in training
                    </td>
                  </tr>
                ) : (
                  volunteers.map((volunteer) => (
                    <tr 
                      key={volunteer.training?.id} 
                      className={selectedVolunteers.has(volunteer.training?.id || '') ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVolunteers.has(volunteer.training?.id || '')}
                          onChange={() => toggleVolunteerSelection(volunteer.training?.id || '')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {volunteer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {volunteer.first_name} {volunteer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{volunteer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volunteer.training?.training_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volunteer.training?.start_date 
                          ? format(new Date(volunteer.training.start_date), 'MMM d, yyyy')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}