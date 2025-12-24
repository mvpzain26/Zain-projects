'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'Volunteer' | 'CaseWorker' | 'Admin'
  created_at: string
}

export default function SupabaseTestPage() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setUsers(null)

    const supabase = createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    setLoading(false)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    setUsers(data as User[])
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Supabase Users Test</h1>

      <button
        onClick={handleTest}
        className="rounded bg-blue-600 px-4 py-2 text-white"
        disabled={loading}
      >
        {loading ? 'Loading…' : 'Fetch Users'}
      </button>

      {error && (
        <p className="text-red-600">
          Error: {error}
        </p>
      )}

      {users && (
        <div className="mt-4 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="rounded border p-2">
              <div>{u.first_name} {u.last_name}</div>
              <div className="text-sm text-gray-500">
                {u.email} • {u.role}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
