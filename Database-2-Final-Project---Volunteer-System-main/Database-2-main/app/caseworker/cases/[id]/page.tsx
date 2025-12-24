'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeClass } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, User, Calendar, MessageSquare, Edit } from 'lucide-react';
import Link from 'next/link';

interface CaseDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string | null;
  volunteer: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  caseworker: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function CaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('cases')
          .select(`
            *,
            volunteer:volunteer_id (first_name, last_name, email),
            caseworker:caseworker_id (first_name, last_name, email)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setCaseData(data as CaseDetails);
      } catch (err) {
        console.error('Error fetching case details:', err);
        setError('Failed to load case details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cases
        </Button>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="font-medium text-red-700">Error loading case</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
        
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cases
        </Button>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Case not found</h2>
          <p className="text-gray-600 mb-6">The case you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/caseworker')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cases
      </Button>

      <div className="grid gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{caseData.title || 'Untitled Case'}</h1>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Badge className={getStatusBadgeClass(caseData.status)}>
                {caseData.status}
              </Badge>
              <span className="mx-2">•</span>
              <span>Case ID: {caseData.id}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/caseworker/cases/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Link>
            </Button>
            {caseData.status === 'Open' && (
              <Button>Close Case</Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Case Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">
                  {caseData.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Opened</h3>
                  <p>{formatDate(caseData.start_date)}</p>
                </div>
                {caseData.end_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date Closed</h3>
                    <p>{formatDate(caseData.end_date)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Volunteer */}
          {caseData.volunteer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assigned Volunteer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {caseData.volunteer.first_name} {caseData.volunteer.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{caseData.volunteer.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Case Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Case created</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(caseData.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Last updated</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(caseData.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}