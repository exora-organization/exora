import { UserRole } from "./types/user";

/**
 * Checks if a route path is allowed for a given user role.
 * Maps URLs to the roles permitted by the route guards.
 *
 * URL prefix convention:
 *   admin-*  → admin
 *   own-*    → company_owner
 *   em-*     → export_manager (+ admin)
 *   fs-*     → finance_staff  (+ admin)
 *   guest-*  → guest (+ company_owner for application-status)
 */
export function isRouteAllowed(path: string, role: UserRole | null): boolean {
  if (!role) return false;

  const cleanPath = path.split("?")[0]; // strip query parameters

  // Admin routes
  if (cleanPath.startsWith("/admin-")) {
    return role === "admin";
  }

  // Owner routes
  if (cleanPath.startsWith("/own-")) {
    return role === "company_owner";
  }

  // Export Manager routes (admin may also access)
  if (cleanPath.startsWith("/em-")) {
    return ["export_manager", "admin"].includes(role);
  }

  // Finance routes (admin may also access)
  if (cleanPath.startsWith("/fs-") || cleanPath.startsWith("/fs-case")) {
    return ["finance_staff", "admin"].includes(role);
  }

  // Guest routes (company_owner can still check application-status)
  if (cleanPath.startsWith("/guest-")) {
    if (cleanPath.startsWith("/guest-application-status")) {
      return ["guest", "company_owner"].includes(role);
    }
    return role === "guest";
  }

  // All other routes (/, /login, /profile, /invite, /403 etc.) — accessible once authenticated
  return true;
}
