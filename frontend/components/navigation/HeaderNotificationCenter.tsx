"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../../hooks/useUserProfile";
import { apiExportCase } from "../../lib/api/export-case";
import { apiAdmin } from "../../lib/api/admin";
import { apiCompany } from "../../lib/api/company";

import {
  notificationStore,
  generateNotificationsFromRealCases,
  generateChangeRequestNotifications,
  generateGuestApplicationNotifications,
  WorkflowNotification,
} from "../../lib/services/notificationStore";

export function HeaderNotificationCenter() {
  const { role, companyId } = useUserProfile();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userActions, setUserActions] = useState<WorkflowNotification[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch real export cases from backend API
  const { data: casesData } = useQuery({
    queryKey: ["export-cases-notification"],
    queryFn: () => apiExportCase.list(),
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch pending change requests for Admin
  const { data: adminChangeReqsData } = useQuery({
    queryKey: ["admin-change-requests-notification"],
    queryFn: () => apiAdmin.getCompanyChangeRequests(),
    enabled: role === "admin",
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch pending change request for Company Owner
  const { data: ownerChangeReqData } = useQuery({
    queryKey: ["owner-change-request-notification", companyId],
    queryFn: () => apiCompany.getPendingChangeRequest(companyId as string),
    enabled: role === "company_owner" && !!companyId,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch guest application status
  const { data: guestAppStatusData } = useQuery({
    queryKey: ["guest-application-status-notification"],
    queryFn: () => apiCompany.getApplicationStatus(),
    enabled: role === "guest",
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const realCases = casesData?.data?.items || [];
  const adminPendingReqs = adminChangeReqsData?.data?.items || [];
  const ownerReq = ownerChangeReqData?.data;
  const guestAppStatus = guestAppStatusData?.data?.status;

  const refreshUserActions = () => {
    setUserActions(notificationStore.getUserNotifications());
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    refreshUserActions();

    const handleUpdate = () => refreshUserActions();
    window.addEventListener("exora_notification_update", handleUpdate);
    const interval = setInterval(refreshUserActions, 5000);

    return () => {
      window.removeEventListener("exora_notification_update", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);


  // Merge dynamic real-case & change request notifications with user action notifications
  const allNotifications = useMemo(() => {
    const dynamicRealNotifs = generateNotificationsFromRealCases(realCases);
    const dynamicCRNotifs = generateChangeRequestNotifications(adminPendingReqs, ownerReq);
    const dynamicGuestNotifs = generateGuestApplicationNotifications(guestAppStatusData?.data);
    
    // Combine and eliminate duplicates by ID
    const combined = [...userActions, ...dynamicCRNotifs, ...dynamicRealNotifs, ...dynamicGuestNotifs];
    const uniqueMap = new Map<string, WorkflowNotification>();
    combined.forEach((n) => {
      if (!uniqueMap.has(n.id)) {
        uniqueMap.set(n.id, n);
      }
    });

    return Array.from(uniqueMap.values());
  }, [realCases, adminPendingReqs, ownerReq, guestAppStatusData?.data, userActions, refreshTrigger]);

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(
      (n) => !role || n.targetRole === role || role === "admin"
    );
  }, [allNotifications, role]);

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetNotifIds = filteredNotifications.map((n) => n.id);
    notificationStore.markAllAsRead(role || undefined, targetNotifIds);
    refreshUserActions();
  };

  const handleNotificationClick = (n: WorkflowNotification) => {
    notificationStore.markAsRead(n.id);
    refreshUserActions();
    setIsOpen(false);
    const href = getCaseHref(n);
    if (href) {
      router.push(href);
    }
  };

  const getCaseHref = (n: WorkflowNotification) => {
    if (n.targetTab === "company_profile") return "/own-company-profile";
    if (n.targetTab === "change_requests") return "/admin-company-applications";
    if (n.targetRole === "admin") return "/admin-company-applications";
    if (n.targetRole === "guest") return "/guest-dashboard";
    if (role === "export_manager") return `/em-export-case/${n.caseId}?tab=${n.targetTab}`;
    if (role === "finance_staff") return `/fs-export-cases/${n.caseId}?tab=${n.targetTab}`;
    return `/own-export-cases/${n.caseId}?tab=${n.targetTab}`;
  };

  const getNotificationStyles = (n: WorkflowNotification) => {
    if (n.isRead) {
      return {
        card: "bg-[#FAF8F3]/50 border-[#E8E3D9] text-[#6B7280] hover:border-gray-300 hover:shadow-sm",
        label: "text-gray-400",
      };
    }
    switch (n.variant) {
      case "blue":
        return {
          card: "bg-blue-50/60 border-blue-500/30 text-[#1F2937] font-semibold shadow-xs hover:border-blue-500 hover:shadow-md",
          label: "text-blue-600",
        };
      case "error":
        return {
          card: "bg-red-50/60 border-red-500/30 text-[#1F2937] font-semibold shadow-xs hover:border-red-500 hover:shadow-md",
          label: "text-red-600",
        };
      case "warning":
        return {
          card: "bg-orange-50/60 border-orange-500/30 text-[#1F2937] font-semibold shadow-xs hover:border-orange-500 hover:shadow-md",
          label: "text-orange-600",
        };
      case "success":
      default:
        return {
          card: "bg-[#EBF8F2]/60 border-[#00A651]/30 text-[#1F2937] font-semibold shadow-xs hover:border-[#00A651] hover:shadow-md",
          label: "text-[#00A651]",
        };
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 hover:border-[#00A651]/50 text-[#4B5563] hover:text-[#00A651] shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none"
        title="Notification Center"
      >
        <Icon icon="solar:bell-bold-duotone" className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:bell-bold-duotone" className="w-5 h-5 text-[#00A651]" />
              <h4 className="text-base font-extrabold text-[#1F2937]">Workflow Notifications</h4>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#00A651] hover:underline cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#EBF8F2] transition-all"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-gray-400">
                No workflow notifications right now.
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const styles = getNotificationStyles(n);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`block p-3.5 rounded-2xl border transition-all cursor-pointer ${styles.card}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider truncate max-w-[200px] ${styles.label}`}>
                        {n.caseName}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs leading-snug font-medium text-[#374151]">{n.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

}
