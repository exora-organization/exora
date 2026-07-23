"use client";

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

const STORAGE_KEY = "exora_workflow_notifications_v1";

const DEFAULT_NOTIFICATIONS: WorkflowNotification[] = [
  {
    id: "n-1",
    caseId: "case-1",
    caseName: "Coconut Charcoal Briquettes to Japan",
    message: "Costing data completed by Finance Staff (SD). Pricing & Risk simulation can now begin.",
    targetRole: "export_manager",
    targetTab: "pricing",
    timestamp: "Just now",
    isRead: false,
  },
  {
    id: "n-2",
    caseId: "case-2",
    caseName: "Arabica Coffee Beans to Vietnam",
    message: "Pricing strategy & Incoterms calculated by Export Manager (EM).",
    targetRole: "finance_staff",
    targetTab: "financial",
    timestamp: "15 min ago",
    isRead: false,
  },
  {
    id: "n-3",
    caseId: "case-1",
    caseName: "Coconut Charcoal Briquettes to Japan",
    message: "Export Feasibility Report (Score 83.5 - High) ready for executive review & PDF download.",
    targetRole: "company_owner",
    targetTab: "overview",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "n-4",
    caseId: "app-1",
    caseName: "PT Java Expor Nusantara",
    message: "New company application submitted. Pending System Admin verification.",
    targetRole: "admin",
    targetTab: "applications",
    timestamp: "2 hours ago",
    isRead: false,
  },
];

export const notificationStore = {
  getNotifications: (): WorkflowNotification[] => {
    if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  addNotification: (notification: Omit<WorkflowNotification, "id" | "timestamp" | "isRead">) => {
    if (typeof window === "undefined") return;
    const current = notificationStore.getNotifications();
    const newNotif: WorkflowNotification = {
      ...notification,
      id: `n-${Date.now()}`,
      timestamp: "Just now",
      isRead: false,
    };
    const updated = [newNotif, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },

  markAsRead: (id: string) => {
    if (typeof window === "undefined") return;
    const current = notificationStore.getNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exora_notification_update"));
  },

  markAllAsRead: (role?: string) => {
    if (typeof window === "undefined") return;
    const current = notificationStore.getNotifications();
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
