import { UserRole } from "./types/user";

/**
 * Checks if a route path is allowed for a given user role.
 * Maps URLs to the roles permitted by the route guards.
 */
export function isRouteAllowed(path: string, role: UserRole | null): boolean {
  if (!role) return false;
  
  const cleanPath = path.split('?')[0]; // strip query parameters

  if (cleanPath.startsWith('/admin')) {
    return role === 'admin';
  }
  if (
    cleanPath.startsWith('/owner') || 
    cleanPath.startsWith('/export-cases') || 
    cleanPath.startsWith('/team-management') || 
    cleanPath.startsWith('/company-profile') || 
    cleanPath.startsWith('/export-feasibility-report')
  ) {
    return role === 'company_owner';
  }
  if (
    cleanPath.startsWith('/finance') || 
    cleanPath.startsWith('/costing') || 
    cleanPath.startsWith('/financial-analysis') || 
    cleanPath.startsWith('/pricing') ||
    cleanPath.startsWith('/finance-case')
  ) {
    return ['finance_staff', 'admin'].includes(role);
  }
  if (
    cleanPath.startsWith('/export-case') || 
    cleanPath.startsWith('/export-manager') || 
    cleanPath.startsWith('/em-') || 
    cleanPath.startsWith('/ai-advisor') || 
    cleanPath.startsWith('/analytics')
  ) {
    return ['export_manager', 'admin'].includes(role);
  }
  if (
    cleanPath.startsWith('/guest-dashboard') || 
    cleanPath.startsWith('/company-application') || 
    cleanPath.startsWith('/application-status')
  ) {
    return ['guest', 'company_owner'].includes(role);
  }

  // All other routes (e.g. /, /login, /profile) are public or globally accessible once authenticated
  return true;
}
