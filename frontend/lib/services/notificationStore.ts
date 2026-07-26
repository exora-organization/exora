"use client";

import { ExportCaseListItem } from "../types/export-case";
import { ProfileChangeResponse } from "../types/company";

export interface WorkflowNotification {
  id: string;
  caseId: string;
  caseName: string;
  message: string;
  targetRole: "company_owner" | "export_manager" | "finance_staff" | "admin" | "guest";
  targetTab: string;
  timestamp: string;
  isRead: boolean;
}

const STORAGE_KEY = "exora_workflow_user_notifications_v2";
const READ_IDS_KEY = "exora_read_notification_ids_v1";

function getReadIdsSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(READ_IDS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function addReadIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    const set = getReadIdsSet();
    ids.forEach((id) => set.add(id));
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function generateNotificationsFromRealCases(realCases: ExportCaseListItem[]): WorkflowNotification[] {
  const dynamicNotifs: WorkflowNotification[] = [];
  const readIds = getReadIdsSet();

  realCases.forEach((c) => {
    const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (c.status === "draft") {
      const id = `real-draft-${c.caseId}`;
      dynamicNotifs.push({
        id,
        caseId: c.caseId,
        caseName: c.name,
        message: `New export case '${c.name}' to ${c.destinationCountry} initialized. Finance Staff costing breakdown input required.`,
        targetRole: "finance_staff",
        targetTab: "cost",
        timestamp: formattedDate,
        isRead: readIds.has(id),
      });
    } else if (c.status === "in_review") {
      const idEm = `real-review-em-${c.caseId}`;
      dynamicNotifs.push({
        id: idEm,
        caseId: c.caseId,
        caseName: c.name,
        message: `Costing input for '${c.name}' completed. Export Manager pricing & risk simulation unblocked.`,
        targetRole: "export_manager",
        targetTab: "pricing",
        timestamp: formattedDate,
        isRead: readIds.has(idEm),
      });

      const idFs = `real-review-fs-${c.caseId}`;
      dynamicNotifs.push({
        id: idFs,
        caseId: c.caseId,
        caseName: c.name,
        message: `Pricing strategy active for '${c.name}'. Finance Staff BEP & Financial Projections ready for calculation.`,
        targetRole: "finance_staff",
        targetTab: "financial",
        timestamp: formattedDate,
        isRead: readIds.has(idFs),
      });
    } else if (c.status === "finalized") {
      const idOwner = `real-final-owner-${c.caseId}`;
      const scoreText = c.feasibilityScore != null ? ` (Feasibility Score: ${(c.feasibilityScore * 10).toFixed(0)}/100)` : "";
      dynamicNotifs.push({
        id: idOwner,
        caseId: c.caseId,
        caseName: c.name,
        message: `Export Case '${c.name}'${scoreText} fully finalized. Executive Feasibility Report ready for download.`,
        targetRole: "company_owner",
        targetTab: "overview",
        timestamp: formattedDate,
        isRead: readIds.has(idOwner),
      });
    }
  });

  return dynamicNotifs;
}

export function generateChangeRequestNotifications(
  adminPendingRequests: ProfileChangeResponse[] = [],
  ownerRequest?: ProfileChangeResponse | null
): WorkflowNotification[] {
  const dynamicNotifs: WorkflowNotification[] = [];
  const readIds = getReadIdsSet();

  if (adminPendingRequests && adminPendingRequests.length > 0) {
    adminPendingRequests.forEach((req) => {
      const id = `cr-admin-${req.id}`;
      dynamicNotifs.push({
        id,
        caseId: req.companyId,
        caseName: req.after?.companyName || "Company",
        message: `Profile change request for '${req.after?.companyName}' is pending review.`,
        targetRole: "admin",
        targetTab: "change_requests",
        timestamp: new Date(req.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isRead: readIds.has(id),
      });
    });
  }

  if (ownerRequest) {
    const formattedDate = new Date(ownerRequest.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (ownerRequest.status === "approved") {
      const id = `cr-owner-app-${ownerRequest.id}`;
      dynamicNotifs.push({
        id,
        caseId: ownerRequest.companyId,
        caseName: ownerRequest.after?.companyName || "Company",
        message: `Your company profile change request was APPROVED by Admin.`,
        targetRole: "company_owner",
        targetTab: "company_profile",
        timestamp: formattedDate,
        isRead: readIds.has(id),
      });
    } else if (ownerRequest.status === "rejected") {
      const id = `cr-owner-rej-${ownerRequest.id}`;
      dynamicNotifs.push({
        id,
        caseId: ownerRequest.companyId,
        caseName: ownerRequest.before?.companyName || "Company",
        message: `Your company profile change request was REJECTED by Admin. ${ownerRequest.rejectReason ? `Reason: "${ownerRequest.rejectReason}"` : ""}`,
        targetRole: "company_owner",
        targetTab: "company_profile",
        timestamp: formattedDate,
        isRead: readIds.has(id),
      });
    } else if (ownerRequest.status === "pending") {
      const id = `cr-owner-pend-${ownerRequest.id}`;
      dynamicNotifs.push({
        id,
        caseId: ownerRequest.companyId,
        caseName: ownerRequest.after?.companyName || "Company",
        message: `Your profile change request for '${ownerRequest.after?.companyName}' is currently pending Admin review.`,
        targetRole: "company_owner",
        targetTab: "company_profile",
        timestamp: formattedDate,
        isRead: readIds.has(id),
      });
    }
  }

  return dynamicNotifs;
}

export const notificationStore = {
  getUserNotifications: (): WorkflowNotification[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const readIds = getReadIdsSet();
      const list: WorkflowNotification[] = JSON.parse(stored);
      return list.map((n) => (readIds.has(n.id) ? { ...n, isRead: true } : n));
    } catch {
      return [];
    }
  },

  addNotification: (notification: Omit<WorkflowNotification, "id" | "timestamp" | "isRead">) => {
    if (typeof window === "undefined") return;
    const current = notificationStore.getUserNotifications();
    const newNotif: WorkflowNotification = {
      ...notification,
      id: `user-action-${Date.now()}`,
      timestamp: "Just now",
      isRead: false,
    };
    const updated = [newNotif, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },

  markAsRead: (id: string) => {
    if (typeof window === "undefined") return;
    addReadIds([id]);
    const current = notificationStore.getUserNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },

  markAllAsRead: (role?: string, targetNotifIds: string[] = []) => {
    if (typeof window === "undefined") return;
    if (targetNotifIds.length > 0) {
      addReadIds(targetNotifIds);
    }
    const current = notificationStore.getUserNotifications();
    const updated = current.map((n) => {
      if (!role || n.targetRole === role || role === "admin") {
        addReadIds([n.id]);
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },
};

