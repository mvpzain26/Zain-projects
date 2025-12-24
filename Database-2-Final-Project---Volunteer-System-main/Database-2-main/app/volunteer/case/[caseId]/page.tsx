import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, User, Clock, Paperclip, Mail } from "lucide-react";

import { recommendClosureAction, addActivityAction } from "../../actions"; 
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";


interface Activity {
    id: number;
    timestamp: string;
    type: 'Note' | 'Meeting' | 'Update';
    body: string;
    added_by: 'Volunteer' | 'Caseworker';
}

interface Document {
    id: number;
    name: string;
    timestamp: string;
    added_by: 'Volunteer' | 'Caseworker';
    url: string; 
}

interface CaseData {
    id: string;
    family_name: string; // The alias of title
    caseworker_id: string;
    caseworker_first_name: string;
    caseworker_last_name: string;
    caseworker_email: string;
    caseworker_notes: string;
    status: 'Open' | 'Assigned' | 'In Progress' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    date_assigned: string;
    last_updated: string;
    notes_and_activity: Activity[];
    documents: Document[];
}

interface SupabaseCaseRow {
    id: string;
    title: string;
    family_name: string;
    caseworker_id: string;
    caseworker_notes: string;
    status: 'Open' | 'Assigned' | 'In Progress' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    date_assigned: string;
    last_updated: string;
    notes_and_activity?: Activity[];
    documents?: Document[];
    caseworker: {
        caseworker_first_name: string;
        caseworker_last_name: string;
        caseworker_email: string;
    } | null; // Nested object from the join
}

// -------------------------------------

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Closed': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const fetchCaseData = async (caseId: string, supabase: ReturnType<typeof createClient>): Promise<CaseData | null> => {
    try {
        const { data, error } = await supabase
            .from('cases')
            .select(`
                id,
                title AS family_name,
                caseworker_id,
                caseworker_notes,
                status,
                priority,
                date_assigned,
                last_updated,
                
                // FIX: Corrected syntax for nested join (assuming 'caseworker_id' is the foreign key column)
                caseworker:caseworker_id (
                    first_name AS caseworker_first_name,
                    last_name AS caseworker_last_name,
                    email AS caseworker_email
                ),
                
                notes_and_activity(*),
                documents(*)
            `)
            .eq('id', caseId)
            .single<SupabaseCaseRow>(); // Apply the new, correct SupabaseRow type

        if (error || !data) {
            console.error('Error fetching case:', error);
            return null;
        }

        const caseData: CaseData = {
            id: data.id,
            family_name: data.family_name,
            caseworker_id: data.caseworker_id,
            caseworker_first_name: data.caseworker?.caseworker_first_name ?? 'N/A', 
            caseworker_last_name: data.caseworker?.caseworker_last_name ?? 'N/A', 
            caseworker_email: data.caseworker?.caseworker_email ?? 'N/A', 
            caseworker_notes: data.caseworker_notes ?? '',
            status: data.status,
            priority: data.priority,
            date_assigned: data.date_assigned,
            last_updated: data.last_updated,
            notes_and_activity: data.notes_and_activity ?? [],
            documents: data.documents ?? [],
        };

        return caseData;

    } catch (e) {
        console.error(`Critical error fetching case ${caseId}:`, e);
        return null;
    }
};

export default async function VolunteerCasePage({ params }: { params: { caseId: string } }) {
    const caseId = params.caseId;
    const supabase = createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const caseData = await fetchCaseData(caseId, supabase);

    if (!caseData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-lg m-8 max-w-lg mx-auto">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4"/>
                <h2 className="text-2xl font-bold text-gray-800">Case Not Found</h2>
                <p className="text-gray-500 mt-2">The case ID "{caseId}" does not exist or the data could not be retrieved.</p>
                <a href="/volunteer" className="mt-4 text-primary-600 hover:text-primary-700 underline font-medium">
                    &larr; Go back to the Volunteer Case List
                </a>
            </div>
        );
    }

    const closureRecommended = caseData.status === 'In Progress';

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-gray-50 min-h-screen py-10 md:py-16">
            <div className="container max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
                <h1 className="font-semibold text-3xl font-inter text-gray-900 md:text-4xl">
                    Case: {caseData.family_name}
                </h1>
                
                {/* 1. Case Overview (Profile Card Style) */}
                <section>
                    <Card className="border-primary/10 bg-white shadow-xl rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary"/> Case Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
                            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                                <p className="font-medium text-gray-700">Case Details</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Case ID:</span>
                                    <span className="font-mono text-gray-800 text-xs">{caseData.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Family:</span>
                                    <span className="font-semibold text-gray-800">{caseData.family_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Status:</span>
                                    <span
                                        className={"inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors " + getStatusBadgeClass(caseData.status)}
                                    >
                                        {caseData.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                                <p className="font-medium text-gray-700">Dates & Priority</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Priority:</span>
                                    <span className={`font-medium ${caseData.priority === 'High' ? 'text-red-600' : caseData.priority === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>
                                        {caseData.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Assigned:</span>
                                    <span className="text-gray-800">{formatDate(caseData.date_assigned).split(',')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Last Update:</span>
                                    <span className="text-gray-800">{formatDate(caseData.last_updated)}</span>
                                </div>
                            </div>
                            
                            {/* 5. Assigned Caseworker Contact Card */}
                            <div className="space-y-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
                                <p className="font-medium text-primary-700 flex items-center gap-1">
                                    <User className="h-4 w-4 text-primary"/> Assigned Caseworker
                                </p>
                                <p className="text-base font-semibold text-gray-900">{caseData.caseworker_first_name} {caseData.caseworker_last_name}</p>
                                <p className="text-xs flex items-center gap-1 text-gray-600">
                                    <Mail className="h-3 w-3 text-primary-500"/> {caseData.caseworker_email}
                                </p>
                                <Separator className="my-2 bg-primary/20"/>
                                <p className="text-xs font-medium text-primary-600">Instructions:</p>
                                <p className="text-xs italic text-gray-600 break-words">
                                    {caseData.caseworker_notes}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* 3. Add New Activity (Inline Form) */}
                        <Card className="border-primary/10 bg-white shadow-md rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-800">Add New Activity</CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Log a note, meeting summary, or status update for your caseworker.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={addActivityAction} className="space-y-4">
                                    <input type="hidden" name="caseId" value={caseId} />
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1">
                                            <Label htmlFor="activityType">Activity Type</Label>
                                            <Select name="type" required>
                                                <SelectTrigger id="activityType" className="w-full">
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Note">Note</SelectItem>
                                                    <SelectItem value="Meeting">Meeting Log</SelectItem>
                                                    <SelectItem value="Update">Status Update</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-3">
                                            <Label htmlFor="activityBody">Details (Max 200 Characters)</Label>
                                            <Textarea 
                                                id="activityBody" 
                                                name="body" 
                                                placeholder="Briefly describe the interaction or note." 
                                                maxLength={200}
                                                required
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 transition-colors rounded-lg">
                                        Submit Activity Log
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* 2. Activity Timeline (Notes + Meetings + Events) */}
                        <Card className="border-primary/10 bg-white shadow-md rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-800">Activity Timeline</CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Full history of notes, meetings, and key updates, ordered by time.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-0">
                                <div className="space-y-6 border-l-2 border-primary/20 pl-6">
                                    {caseData.notes_and_activity.map((item) => (
                                        <div key={item.id} className="relative space-y-1">
                                            {/* Timeline dot */}
                                            <span className={`absolute -left-[14.5px] mt-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${item.added_by === 'Volunteer' ? 'bg-primary' : 'bg-green-500'}`} />
                                            
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                <Clock className='h-3 w-3'/> {formatDate(item.timestamp)}
                                            </p>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.type === 'Note' ? 'bg-blue-100 text-blue-800' : item.type === 'Meeting' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {item.type}
                                                </span>
                                                <span className={`text-[10px] font-medium ${item.added_by === 'Volunteer' ? 'text-primary-600' : 'text-green-600'}`}>
                                                    ({item.added_by})
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border">{item.body}</p>
                                        </div>
                                    ))}
                                    {caseData.notes_and_activity.length === 0 && (
                                        <p className="text-center text-gray-500 text-sm italic py-4">No activity logged yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* 6. Recommend Closure UI (COMPLETED SECTION) */}
                        <Card className={`border-yellow-400/50 ${closureRecommended ? 'bg-yellow-100' : 'bg-yellow-50'} shadow-md rounded-xl`}>
                            <CardHeader className='pb-3'>
                                <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                                    <AlertTriangle className='h-5 w-5 text-yellow-600'/> Recommend Case Closure
                                </CardTitle>
                                <CardDescription className="text-sm text-yellow-700">
                                    If the family has met key milestones and is self-sufficient, recommend closure to the Caseworker.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {closureRecommended ? (
                                    <div className="space-y-3 p-3 border border-yellow-400 rounded-lg bg-yellow-100">
                                        <p className="text-sm font-medium text-yellow-800">
                                            Closure Pending Review
                                        </p>
                                        <p className="text-xs text-yellow-700">
                                            The case status has been updated to "In Progress" and your Caseworker has been notified to review the recommendation for final closure.
                                        </p>
                                    </div>
                                ) : (
                                    <form action={recommendClosureAction.bind(null, caseId)}>
                                        <Button 
                                            type="submit" 
                                            className="w-full bg-yellow-600 hover:bg-yellow-700 transition-colors rounded-lg"
                                            disabled={caseData.status !== 'Open' && caseData.status !== 'Assigned'} 
                                        >
                                            Send Closure Recommendation
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* 7. Documents Section (Optional - Add for completeness) */}
                        <Card className="border-primary/10 bg-white shadow-md rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                    <Paperclip className='h-5 w-5 text-primary'/> Case Documents
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Files uploaded by you and the Caseworker.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
                                {caseData.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-gray-50 transition-colors border-b">
                                        <span className="font-medium text-gray-700 truncate">{doc.name}</span>
                                        <div className="flex-shrink-0 text-right space-x-2">
                                            <span className="text-gray-500 text-[10px]">{doc.added_by}</span>
                                            <span className="text-gray-400 text-[10px]">{formatDate(doc.timestamp).split(',')[0]}</span>
                                        </div>
                                    </div>
                                ))}
                                {caseData.documents.length === 0 && (
                                    <p className="text-center text-gray-500 text-sm italic py-4">No documents found for this case.</p>
                                )}
                                <Button size="sm" variant="outline" className="w-full mt-4 text-xs">
                                    Upload New Document (Placeholder)
                                </Button>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}