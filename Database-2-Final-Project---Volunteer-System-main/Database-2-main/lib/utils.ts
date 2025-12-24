import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-status-open/10 text-status-open border-status-open/20'
    case 'assigned':
      return 'bg-status-assigned/10 text-status-assigned border-status-assigned/20'
    case 'in progress':
      return 'bg-status-inprogress/10 text-status-inprogress border-status-inprogress/20'
    case 'closed':
      return 'bg-status-closed/10 text-status-closed border-status-closed/20'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getBadgeColorClass(badgeName: string): string {
  switch (badgeName.toLowerCase()) {
    case 'cornerstone companion':
      return 'bg-badge-cornerstone/10 text-badge-cornerstone border-badge-cornerstone/20'
    case 'bridge builder':
      return 'bg-badge-bridge/10 text-badge-bridge border-badge-bridge/20'
    case 'beacon of hope':
      return 'bg-badge-beacon/10 text-badge-beacon border-badge-beacon/20'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}