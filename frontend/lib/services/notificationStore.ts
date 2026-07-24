"use client";

import { ExportCaseListItem } from "../types/export-case";

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

export function generateNotificationsFromRealCases(realCases: ExportCaseListItem[]): WorkflowNotification[] {
  const dynamicNotifs: WorkflowNotification[] = [];

  realCases.forEach((c) => {
    const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (c.status === "draft") {
      dynamicNotifs.push({
        id: `real-draft-${c.caseId}`,
        caseId: c.caseId,
        caseName: c.name,
        message: `New export case '${c.name}' to ${c.destinationCountry} initialized. Finance Staff costing breakdown input required.`,
        targetRole: "finance_staff",
        targetTab: "cost",
        timestamp: formattedDate,
        isRead: false,
      });
    } else if (c.status === "in_review") {
      dynamicNotifs.push({
        id: `real-review-em-${c.caseId}`,
        caseId: c.caseId,
        caseName: c.name,
        message: `Costing input for '${c.name}' completed. Export Manager pricing & risk simulation unblocked.`,
        targetRole: "export_manager",
        targetTab: "pricing",
        timestamp: formattedDate,
        isRead: false,
      });

      dynamicNotifs.push({
        id: `real-review-fs-${c.caseId}`,
        caseId: c.caseId,
        caseName: c.name,
        message: `Pricing strategy active for '${c.name}'. Finance Staff BEP & Financial Projections ready for calculation.`,
        targetRole: "finance_staff",
        targetTab: "financial",
        timestamp: formattedDate,
        isRead: false,
      });
    } else if (c.status === "finalized") {
      const scoreText = c.feasibilityScore != null ? ` (Feasibility Score: ${(c.feasibilityScore * 10).toFixed(0)}/100)` : "";
      dynamicNotifs.push({
        id: `real-final-owner-${c.caseId}`,
        caseId: c.caseId,
        caseName: c.name,
        message: `Export Case '${c.name}'${scoreText} fully finalized. Executive Feasibility Report ready for download.`,
        targetRole: "company_owner",
        targetTab: "overview",
        timestamp: formattedDate,
        isRead: false,
      });
    }
  });

  return dynamicNotifs;
}

export const notificationStore = {
  getUserNotifications: (): WorkflowNotification[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
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
    const current = notificationStore.getUserNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },

  markAllAsRead: (role?: string) => {
    if (typeof window === "undefined") return;
    const current = notificationStore.getUserNotifications();
    const updated = current.map((n) => {
      if (!role || n.targetRole === role || role === "admin") {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },
};
