"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useUserProfile } from "../../hooks/useUserProfile";
import { notificationStore, WorkflowNotification } from "../../lib/services/notificationStore";

export function HeaderNotificationCenter() {
  const { role } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);

  const refreshNotifications = () => {
    setNotifications(notificationStore.getNotifications());
  };

  useEffect(() => {
    refreshNotifications();

    const handleUpdate = () => refreshNotifications();
    window.addEventListener("exora_notification_update", handleUpdate);
    const interval = setInterval(refreshNotifications, 5000);

    return () => {
      window.removeEventListener("exora_notification_update", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const filteredNotifications = notifications.filter(
    (n) => !role || n.targetRole === role || role === "admin"
  );
  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    notificationStore.markAllAsRead(role || undefined);
    refreshNotifications();
  };

  const handleNotificationClick = (n: WorkflowNotification) => {
    notificationStore.markAsRead(n.id);
    refreshNotifications();
    setIsOpen(false);
  };

  const getCaseHref = (n: WorkflowNotification) => {
    if (n.targetRole === "admin") return "/admin-company-applications";
    if (n.targetRole === "guest") return "/guest-dashboard";
    if (role === "export_manager") return `/em-export-case/${n.caseId}?tab=${n.targetTab}`;
    if (role === "finance_staff") return `/fs-export-cases/${n.caseId}?tab=${n.targetTab}`;
    return `/own-export-cases/${n.caseId}?tab=${n.targetTab}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white border border-[#E8E3D9] hover:border-[#00A651]/40 text-[#4B5563] hover:text-[#00A651] shadow-sm transition-all cursor-pointer focus:outline-none"
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
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#E8E3D9] shadow-2xl rounded-3xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D9] mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="solar:bell-bold-duotone" className="w-5 h-5 text-[#00A651]" />
                <h4 className="text-base font-extrabold text-[#1F2937]">Workflow Notifications</h4>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-[#00A651] hover:underline cursor-pointer"
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
                filteredNotifications.map((n) => (
                  <Link
                    key={n.id}
                    href={getCaseHref(n)}
                    onClick={() => handleNotificationClick(n)}
                    className={`block p-3.5 rounded-2xl border transition-all ${
                      n.isRead
                        ? "bg-[#FAF8F3]/50 border-[#E8E3D9] text-[#6B7280]"
                        : "bg-[#EBF8F2]/60 border-[#00A651]/30 text-[#1F2937] font-semibold shadow-xs"
                    } hover:border-[#00A651] hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00A651] truncate max-w-[200px]">
                        {n.caseName}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs leading-snug font-medium text-[#374151]">{n.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
