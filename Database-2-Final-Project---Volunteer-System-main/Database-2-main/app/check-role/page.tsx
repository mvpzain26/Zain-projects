'use client';

import { useEffect, useState } from 'react';

export default function CheckRolePage() {
  const [roleInfo, setRoleInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch('/api/check-role');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch role');
        }
        
        setRoleInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading role information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Error: {error}</p>
          <p className="mt-2">You might need to be logged in to view this information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">User Role Information</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Database Information</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(roleInfo, null, 2)}
        </pre>
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-medium text-blue-800">What to look for:</h3>
          <ul className="list-disc pl-5 mt-2 text-blue-700">
            <li>Check the <code>role</code> field in the JSON output above</li>
            <li>It should exactly match the role you're testing with (case-sensitive)</li>
            <li>Current expected role for caseworkers: <code>CaseWorker</code> (capital C and W)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
