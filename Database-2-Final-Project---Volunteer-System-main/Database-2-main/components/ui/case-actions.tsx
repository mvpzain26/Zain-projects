"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import React from "react"

export interface CaseActionsProps {
  caseId: string
  caseTitle: string
  status: string
  role: 'caseworker' | 'volunteer' | 'admin'
  onCloseCase?: () => void
}

export function CaseActions({ 
  caseId, 
  caseTitle, 
  status,
  role,
  onCloseCase 
}: CaseActionsProps) {
  const handleAction = (e: Event) => {
    e.preventDefault()
    onCloseCase?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/caseworker/cases/${caseId}`} className="cursor-pointer w-full">
            View Case Details
          </Link>
        </DropdownMenuItem>
        
        {role === 'caseworker' && status !== 'Closed' && (
          <DropdownMenuItem 
            onSelect={handleAction}
            className="text-red-600 cursor-pointer focus:bg-red-50"
          >
            Close Case
          </DropdownMenuItem>
        )}

        {role === 'volunteer' && status === 'Open' && (
          <DropdownMenuItem 
            onSelect={handleAction}
            className="text-amber-600 cursor-pointer focus:bg-amber-50"
          >
            Recommend Closure
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
