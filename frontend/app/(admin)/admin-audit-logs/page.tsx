"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";
import { useState, useMemo } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Icon } from "@iconify/react";
import { AuditLog } from "../../../lib/types/admin";

interface AuditLogExtended {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: "Create" | "Update" | "Delete" | "Approve" | "Login" | "Generate Report" | "View";
  module: "Company" | "Export Case" | "Finance" | "Document" | "AI" | "User" | "System";
  resource: string;
  friendlyName: string;
  cvss: number;
  severity: "None" | "Low" | "Medium" | "High" | "Critical";
  timestamp: string;
  ip: string;
  browser: string;
  companyName: string;
  details: any;
}

type GroupedOrSingleLog = 
  | {
      isGroup: true;
      id: string;
      actorId: string;
      actorName: string;
      actorRole: string;
      action: string;
      module: string;
      resource: string;
      friendlyName: string;
      cvss: number;
      severity: string;
      timestamp: string;
      companyName: string;
      logs: AuditLogExtended[];
    }
  | {
      isGroup: false;
      id: string;
      actorId: string;
      actorName: string;
      actorRole: string;
      action: string;
      module: string;
      resource: string;
      friendlyName: string;
      cvss: number;
      severity: string;
      timestamp: string;
      companyName: string;
      log: AuditLogExtended;
    };

// Map CVSS score to qualitative severity scale
const mapCvssToSeverity = (score: number): "None" | "Low" | "Medium" | "High" | "Critical" => {
  if (score <= 0) return "None";
  if (score >= 0.1 && score <= 3.9) return "Low";
  if (score >= 4.0 && score <= 6.9) return "Medium";
  if (score >= 7.0 && score <= 8.9) return "High";
  if (score >= 9.0 && score <= 10.0) return "Critical";
  return "None";
};

// Simulated logs with dynamic timestamps relative to standard current time (2026-07-20)
const getSimulatedLogs = (): AuditLogExtended[] => {
  const now = new Date("2026-07-20T02:43:51+07:00");
  
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  const daysAgo = (d: number, h = 12, m = 0) => {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    date.setHours(h, m, 0, 0);
    return date.toISOString();
  };

  return [
    {
      id: "sim-1",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Approve",
      module: "Company",
      resource: "ABC Export",
      friendlyName: "Approved Company \"ABC Export\"",
      cvss: 1.5,
      severity: mapCvssToSeverity(1.5),
      timestamp: minutesAgo(5),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh; OS X 10.15)",
      companyName: "ABC Export",
      details: {
        status: { before: "pending", after: "approved" }
      }
    },
    {
      id: "sim-2-1",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Update",
      module: "Export Case",
      resource: "Indonesia → Japan",
      friendlyName: "Updated Export Case \"Indonesia → Japan\"",
      cvss: 2.0,
      severity: mapCvssToSeverity(2.0),
      timestamp: minutesAgo(20),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh; OS X 10.15)",
      companyName: "WacanaTech Coffee Export",
      details: {
        quantity: { before: "10 MT", after: "20 MT" }
      }
    },
    {
      id: "sim-2-2",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Update",
      module: "Export Case",
      resource: "Indonesia → Japan",
      friendlyName: "Updated Export Case \"Indonesia → Japan\"",
      cvss: 2.0,
      severity: mapCvssToSeverity(2.0),
      timestamp: minutesAgo(21),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh; OS X 10.15)",
      companyName: "WacanaTech Coffee Export",
      details: {
        destination: { before: "China", after: "Japan" }
      }
    },
    {
      id: "sim-2-3",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Update",
      module: "Export Case",
      resource: "Indonesia → Japan",
      friendlyName: "Updated Export Case \"Indonesia → Japan\"",
      cvss: 2.0,
      severity: mapCvssToSeverity(2.0),
      timestamp: minutesAgo(22),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh; OS X 10.15)",
      companyName: "WacanaTech Coffee Export",
      details: {
        freight: { before: "FOB", after: "CIF" }
      }
    },
    {
      id: "sim-2-4",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Update",
      module: "Export Case",
      resource: "Indonesia → Japan",
      friendlyName: "Updated Export Case \"Indonesia → Japan\"",
      cvss: 2.0,
      severity: mapCvssToSeverity(2.0),
      timestamp: minutesAgo(23),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh; OS X 10.15)",
      companyName: "WacanaTech Coffee Export",
      details: {
        margin: { before: "18%", after: "22%" }
      }
    },
    {
      id: "sim-2-5",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Update",
      module: "Export Case",
      resource: "Indonesia → Japan",
      friendlyName: "Updated Export Case \"Indonesia → Japan\"",
      cvss: 2.0,
      severity: mapCvssToSeverity(2.0),
      timestamp: minutesAgo(24),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh; OS X 10.15)",
      companyName: "WacanaTech Coffee Export",
      details: {
        buyer: { before: "Xincheng Ltd", after: "Sato Importers" }
      }
    },
    {
      id: "sim-3",
      actorId: "system",
      actorName: "System",
      actorRole: "AI Scheduler",
      action: "Delete",
      module: "Company",
      resource: "XYZ Export",
      friendlyName: "Deleted Company \"XYZ Export\"",
      cvss: 9.2,
      severity: mapCvssToSeverity(9.2),
      timestamp: hoursAgo(1.5),
      ip: "System Internal",
      browser: "Internal Task Runner",
      companyName: "XYZ Export",
      details: {
        reason: "Compliance violation: repeated failure to submit legal tax identification numbers.",
        companyId: "comp_xyz_789"
      }
    },
    {
      id: "sim-4",
      actorId: "usr_finance",
      actorName: "Michael Tan",
      actorRole: "Finance Staff",
      action: "Generate Report",
      module: "AI",
      resource: "Feasibility Report",
      friendlyName: "Generated Feasibility Report",
      cvss: 0.0,
      severity: mapCvssToSeverity(0.0),
      timestamp: hoursAgo(3),
      ip: "103.112.45.18",
      browser: "Safari (Mac OS)",
      companyName: "WacanaTech Coffee Export",
      details: {
        caseId: "case-coffee-tokyo",
        feasibilityScore: "83.5",
        status: "Completed"
      }
    },
    {
      id: "sim-5",
      actorId: "usr_finance",
      actorName: "Michael Tan",
      actorRole: "Finance Staff",
      action: "Update",
      module: "Finance",
      resource: "Cost Configuration",
      friendlyName: "Updated Cost Configuration",
      cvss: 4.8,
      severity: mapCvssToSeverity(4.8),
      timestamp: hoursAgo(4.5),
      ip: "103.112.45.18",
      browser: "Safari (Mac OS)",
      companyName: "WacanaTech Coffee Export",
      details: {
        baseFreightRate: { before: "$1,200", after: "$1,500" },
        insuranceRate: { before: "0.5%", after: "0.65%" }
      }
    },
    {
      id: "sim-6",
      actorId: "ai_advisor",
      actorName: "AI Advisor",
      actorRole: "AI Service",
      action: "Generate Report",
      module: "AI",
      resource: "Export Recommendation",
      friendlyName: "Generated AI Recommendation",
      cvss: 0.0,
      severity: mapCvssToSeverity(0.0),
      timestamp: hoursAgo(8),
      ip: "AI Engine",
      browser: "API Client",
      companyName: "WacanaTech Coffee Export",
      details: {
        target: "Japan Export Route",
        confidence: "94.2%",
        recommendation: "Negotiate 30% advance deposit with 70% paid against copy of B/L to mitigate credit risk."
      }
    },
    {
      id: "sim-7",
      actorId: "guest",
      actorName: "Guest User",
      actorRole: "Guest",
      action: "Login",
      module: "User",
      resource: "Auth Portal",
      friendlyName: "Failed Login Attempts",
      cvss: 6.8,
      severity: mapCvssToSeverity(6.8),
      timestamp: hoursAgo(11),
      ip: "198.51.100.42",
      browser: "Firefox (Linux)",
      companyName: "System / Platform",
      details: {
        failedAttempts: 5,
        targetEmail: "admin@exora.app",
        reason: "Invalid password credentials provided sequentially within 2 minutes."
      }
    },
    {
      id: "sim-8",
      actorId: "usr_super_admin",
      actorName: "Super Admin",
      actorRole: "System Admin",
      action: "Update",
      module: "User",
      resource: "Michael Tan Role",
      friendlyName: "Admin Role Changed",
      cvss: 9.8,
      severity: mapCvssToSeverity(9.8),
      timestamp: daysAgo(1, 9, 20),
      ip: "103.112.45.1",
      browser: "Chrome (Windows)",
      companyName: "WacanaTech Coffee Export",
      details: {
        role: { before: "finance_staff", after: "admin" },
        user: "Michael Tan"
      }
    },
    {
      id: "sim-9",
      actorId: "usr_manager",
      actorName: "Sharon Lee",
      actorRole: "Export Manager",
      action: "Create",
      module: "Export Case",
      resource: "Indonesia → USA",
      friendlyName: "Created Export Case \"Indonesia → USA\"",
      cvss: 2.0,
      severity: mapCvssToSeverity(2.0),
      timestamp: daysAgo(2, 14, 15),
      ip: "103.112.46.2",
      browser: "Chrome (Macintosh)",
      companyName: "WacanaTech Coffee Export",
      details: {
        name: "Arabica Coffee to Seattle Port",
        product: "Gayo Mandheling Coffee",
        destination: "USA",
        quantity: "15 MT"
      }
    },
    {
      id: "sim-10",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Delete",
      module: "Document",
      resource: "Quotation_QT-2026-102.pdf",
      friendlyName: "Deleted Document \"Quotation_QT-2026-102.pdf\"",
      cvss: 7.5,
      severity: mapCvssToSeverity(7.5),
      timestamp: daysAgo(3, 10, 30),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh)",
      companyName: "WacanaTech Coffee Export",
      details: {
        documentName: "Quotation_QT-2026-102.pdf",
        associatedCase: "Indonesia → Japan",
        deletedBy: "John Smith"
      }
    },
    {
      id: "sim-11",
      actorId: "usr_admin",
      actorName: "John Smith",
      actorRole: "Admin",
      action: "Login",
      module: "User",
      resource: "Auth Portal",
      friendlyName: "User Logged In",
      cvss: 0.0,
      severity: mapCvssToSeverity(0.0),
      timestamp: daysAgo(4, 11, 0),
      ip: "103.112.45.12",
      browser: "Chrome (Macintosh)",
      companyName: "System / Platform",
      details: {
        status: "Success",
        sessionExpiry: "24 Hours"
      }
    }
  ];
};

const mapRawLogToExtended = (log: AuditLog): AuditLogExtended => {
  const id = log.id || `raw-${log.timestamp}-${Math.random()}`;
  
  let details = log.details;
  if (typeof details === "string") {
    try {
      details = JSON.parse(details);
    } catch (e) {
      details = { rawMessage: details };
    }
  }
  if (!details) details = {};

  // Extract actor info dynamically
  let actorName = log.actorId;
  let actorRole = "User";

  if (log.actorId === "usr_admin" || log.actorId === "seed-admin-uid" || log.actorId === "mock-firebase-admin-uid") {
    actorName = "Admin User";
    actorRole = "Admin";
  } else if (log.actorId === "usr_owner" || log.actorId === "mock-firebase-owner-uid") {
    actorName = "Owner User";
    actorRole = "Owner";
  } else if (log.actorId === "usr_manager" || log.actorId === "mock-firebase-manager-uid") {
    actorName = "Export Manager";
    actorRole = "Manager";
  } else if (log.actorId === "usr_finance" || log.actorId === "mock-firebase-finance-uid") {
    actorName = "Finance User";
    actorRole = "Finance";
  } else {
    if (details.actorEmail) actorName = details.actorEmail;
    else if (details.email) actorName = details.email;
    else if (details.userName) actorName = details.userName;
    
    if (details.actorRole) actorRole = details.actorRole;
    else if (details.role) actorRole = details.role;
  }

  // Format raw actions like "VIEW_AUDIT_LOGS" into "View Audit Logs"
  let friendlyName = log.action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  let module: any = "System";
  let action: any = "View";
  let cvssScore = 1.0; 

  const path = log.resource.toLowerCase();
  
  // Categorize log action type and severity score dynamically
  if (path.includes("company-applications")) {
    module = "Company";
    if (path.includes("/approve")) {
      action = "Approve";
      cvssScore = 1.5;
      friendlyName = `Approved Company Application`;
    } else if (path.includes("/reject")) {
      action = "Approve"; 
      cvssScore = 5.0;
      friendlyName = `Rejected Company Application`;
    } else if (path.includes("/request-revision")) {
      action = "Update";
      cvssScore = 3.0;
      friendlyName = `Requested Company Application Revision`;
    } else {
      action = "View";
      cvssScore = 0.0;
      friendlyName = `Viewed Company Applications`;
    }
  } else if (path.includes("export-cases")) {
    module = "Export Case";
    if (log.action.includes("CREATE") || log.action.includes("POST")) {
      action = "Create";
      cvssScore = 2.0;
      friendlyName = `Created Export Case`;
    } else if (log.action.includes("DELETE") || log.action.includes("REMOVE")) {
      action = "Delete";
      cvssScore = 8.5;
      friendlyName = `Deleted Export Case`;
    } else {
      action = "Update";
      cvssScore = 2.0;
      friendlyName = `Updated Export Case`;
    }
  } else if (path.includes("monitoring")) {
    module = "System";
    action = "View";
    cvssScore = 0.0;
  } else if (path.includes("audit-logs")) {
    module = "System";
    action = "View";
    cvssScore = 0.0;
  } else {
    // Dynamic mapping fallback based on REST keywords
    if (log.action.includes("CREATE") || log.action.includes("POST") || log.action.includes("ADD")) {
      action = "Create";
      cvssScore = 2.0;
    } else if (log.action.includes("UPDATE") || log.action.includes("PUT") || log.action.includes("PATCH")) {
      action = "Update";
      cvssScore = 3.0;
    } else if (log.action.includes("DELETE") || log.action.includes("REMOVE")) {
      action = "Delete";
      cvssScore = 9.0;
    } else if (log.action.includes("LOGIN")) {
      action = "Login";
      cvssScore = 0.0;
    } else if (log.action.includes("REPORT") || log.action.includes("EXPORT")) {
      action = "Generate Report";
      cvssScore = 1.0;
    }
  }

  // Extract client IP and Browser Info dynamically
  const ip = details.ip || details.ipAddress || details.clientIp || details.clientIP || "N/A";
  const browser = details.browser || details.userAgent || details.ua || details.client || "N/A";

  // Derive tenant company name logically
  let companyName = "System / Platform";
  if (details.companyName) {
    companyName = details.companyName;
  } else if (details.tenantName) {
    companyName = details.tenantName;
  } else if (path.includes("export-cases")) {
    companyName = "Active Export Tenant";
  } else if (path.includes("company-applications")) {
    companyName = "System / Pending";
  }

  return {
    id,
    actorId: log.actorId,
    actorName,
    actorRole,
    action,
    module,
    resource: log.resource,
    friendlyName,
    cvss: cvssScore,
    severity: mapCvssToSeverity(cvssScore),
    timestamp: log.timestamp,
    ip,
    browser,
    companyName,
    details
  };
};

export default function AuditLogsPage() {
  const [limit, setLimit] = useState(100);
  const { firebaseUser, loading: authLoading } = useUserProfile();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"Today" | "Last 7 Days" | "Custom" | "All">("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  // Expanded items state
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-audit-logs", limit],
    queryFn: () => apiAdmin.getAuditLogs(limit),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  const rawLogs = data?.data?.auditLogs || [];

  // Use only real database logs, sorted chronologically descending
  const combinedLogs = useMemo(() => {
    const parsedRaw = rawLogs.map(mapRawLogToExtended);
    return parsedRaw.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rawLogs]);

  // Extract unique companies dynamically for filter select
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    combinedLogs.forEach(log => {
      if (log.companyName) companies.add(log.companyName);
    });
    return Array.from(companies);
  }, [combinedLogs]);

  // Apply Search & Filters
  const filteredLogs = useMemo(() => {
    return combinedLogs.filter(log => {
      // 1. Text Search
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
        const matches = 
          log.actorName.toLowerCase().includes(query) ||
          log.actorId.toLowerCase().includes(query) ||
          log.friendlyName.toLowerCase().includes(query) ||
          log.resource.toLowerCase().includes(query) ||
          log.module.toLowerCase().includes(query) ||
          log.severity.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.companyName.toLowerCase().includes(query) ||
          detailsStr.includes(query);
        
        if (!matches) return false;
      }

      // 2. Date Filtering
      const logDate = new Date(log.timestamp);
      const now = new Date("2026-07-20T02:43:51+07:00"); // Base reference time
      
      if (dateFilter === "Today") {
        const isToday = 
          logDate.getDate() === now.getDate() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === "Last 7 Days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (logDate < sevenDaysAgo) return false;
      } else if (dateFilter === "Custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) return false;
        }
      }

      // 3. Company/Tenant Filter
      if (companyFilter !== "All" && log.companyName !== companyFilter) return false;

      // 4. Module Filter
      if (moduleFilter !== "All" && log.module !== moduleFilter) return false;

      // 5. Severity Filter
      if (severityFilter !== "All" && log.severity !== severityFilter) return false;

      return true;
    });
  }, [combinedLogs, searchQuery, dateFilter, startDate, endDate, companyFilter, moduleFilter, severityFilter]);

  // Statistics Calculations (Based on Overall Loaded Logs)
  const stats = useMemo(() => {
    let total = combinedLogs.length;
    let activities = 0;
    let updates = 0;
    let alerts = 0;

    combinedLogs.forEach(log => {
      // 1. Security Alerts: Critical, High and Medium events (e.g. failed logins, deletions, privilege alerts)
      if (log.severity === "Critical" || log.severity === "High" || log.severity === "Medium") {
        alerts++;
      }
      
      // 2. Configuration Updates: case updates, costings updates, creates
      if (log.action === "Update" || log.action === "Create") {
        updates++;
      } else if (log.action === "Approve" || log.action === "Login" || log.action === "Generate Report" || log.action === "View") {
        // 3. System Activities: standard actions (approvals, successful logins, reports, views)
        if (log.action === "Login" && (log.severity === "Critical" || log.severity === "High" || log.severity === "Medium")) {
          // Already counted as alert, don't count as standard activity
        } else {
          activities++;
        }
      }
    });

    return { total, activities, updates, alerts };
  }, [combinedLogs]);

  // Group Consecutive Logs
  const groupedLogs = useMemo(() => {
    const result: GroupedOrSingleLog[] = [];
    let i = 0;
    
    while (i < filteredLogs.length) {
      const current = filteredLogs[i];
      const group: AuditLogExtended[] = [current];
      
      let j = i + 1;
      while (j < filteredLogs.length) {
        const next = filteredLogs[j];
        const timeDiff = Math.abs(new Date(current.timestamp).getTime() - new Date(next.timestamp).getTime());
        
        const isConsecutive = 
          next.actorId === current.actorId &&
          next.action === current.action &&
          next.module === current.module &&
          next.resource === current.resource &&
          timeDiff <= 15 * 60 * 1000; // 15 minutes
        
        if (isConsecutive) {
          group.push(next);
          j++;
        } else {
          break;
        }
      }
      
      if (group.length > 1) {
        result.push({
          isGroup: true,
          id: `group-${current.id}-${group.length}`,
          actorId: current.actorId,
          actorName: current.actorName,
          actorRole: current.actorRole,
          action: current.action,
          module: current.module,
          resource: current.resource,
          friendlyName: `${current.actorName} updated Export Case "${current.resource}" — ${group.length} changes`,
          cvss: current.cvss,
          severity: current.severity,
          timestamp: current.timestamp,
          companyName: current.companyName,
          logs: group
        });
        i = j;
      } else {
        result.push({
          isGroup: false,
          id: current.id,
          actorId: current.actorId,
          actorName: current.actorName,
          actorRole: current.actorRole,
          action: current.action,
          module: current.module,
          resource: current.resource,
          friendlyName: current.friendlyName,
          cvss: current.cvss,
          severity: current.severity,
          timestamp: current.timestamp,
          companyName: current.companyName,
          log: current
        });
        i++;
      }
    }
    
    return result;
  }, [filteredLogs]);

  // Organize grouped/single logs into Day Sections
  const { daySections, dayKeys } = useMemo(() => {
    const sections: { [key: string]: GroupedOrSingleLog[] } = {};
    const keys: string[] = [];
    
    groupedLogs.forEach((item) => {
      const dateObj = new Date(item.timestamp);
      const now = new Date("2026-07-20T02:43:51+07:00");
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      let dayKey = "";
      if (
        dateObj.getDate() === now.getDate() &&
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear()
      ) {
        dayKey = "Today";
      } else if (
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear()
      ) {
        dayKey = "Yesterday";
      } else {
        dayKey = dateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      }
      
      if (!sections[dayKey]) {
        sections[dayKey] = [];
        keys.push(dayKey);
      }
      sections[dayKey].push(item);
    });
    
    return { daySections: sections, dayKeys: keys };
  }, [groupedLogs]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter("All");
    setStartDate("");
    setEndDate("");
    setCompanyFilter("All");
    setModuleFilter("All");
    setSeverityFilter("All");
  };

  // Helper styles for colors
  const getActionColors = (action: string) => {
    switch (action) {
      case "Create":
        return { dot: "bg-blue-500 ring-blue-100", badge: "bg-blue-50 text-blue-700 border-blue-200" };
      case "Approve":
        return { dot: "bg-emerald-500 ring-emerald-100", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "Update":
        return { dot: "bg-amber-500 ring-amber-100", badge: "bg-amber-50 text-amber-700 border-amber-200" };
      case "Delete":
        return { dot: "bg-rose-500 ring-rose-100", badge: "bg-rose-50 text-rose-700 border-rose-200" };
      case "Login":
        return { dot: "bg-amber-500 ring-amber-100", badge: "bg-amber-50 text-amber-700 border-amber-200" };
      case "Generate Report":
        return { dot: "bg-teal-500 ring-teal-100", badge: "bg-teal-50 text-teal-700 border-teal-200" };
      default:
        return { dot: "bg-slate-500 ring-slate-100", badge: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-100 text-rose-800 border-rose-200 font-extrabold";
      case "High":
        return "bg-orange-100 text-orange-850 border-orange-200 font-extrabold";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-200 font-extrabold";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200 font-semibold";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 font-medium";
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "Company": return <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />;
      case "Export Case": return <Icon icon="solar:pulse-bold-duotone" className="w-3.5 h-3.5" />;
      case "Finance": return <Icon icon="solar:settings-bold-duotone" className="w-3.5 h-3.5" />;
      case "Document": return <Icon icon="solar:document-text-bold-duotone" className="w-3.5 h-3.5" />;
      case "AI": return <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />;
      case "User": return <Icon icon="solar:user-bold-duotone" className="w-3.5 h-3.5" />;
      default: return <Icon icon="solar:settings-bold-duotone" className="w-3.5 h-3.5" />;
    }
  };

  const renderDetailsDiff = (details: any) => {
    const keys = Object.keys(details).filter(k => 
      k !== "ip" && 
      k !== "browser" && 
      k !== "reason" && 
      k !== "companyId" && 
      k !== "caseId" && 
      k !== "failedAttempts" && 
      k !== "targetEmail" && 
      k !== "documentName" && 
      k !== "associatedCase" && 
      k !== "deletedBy" && 
      k !== "status" && 
      k !== "sessionExpiry"
    );
    
    const hasStatusDiff = details.status && typeof details.status === "object" && "before" in details.status;
    
    if (keys.length === 0 && !hasStatusDiff) return null;

    return (
      <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Modified Field Diffs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasStatusDiff && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 line-through">{details.status.before}</span>
                <Icon icon="solar:arrow-right-bold-duotone" className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">{details.status.after}</span>
              </div>
            </div>
          )}
          {keys.map((key) => {
            const val = details[key];
            const isDiff = val && typeof val === "object" && "before" in val && "after" in val;
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            
            return (
              <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">{label}</span>
                {isDiff ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200 line-through">{val.before}</span>
                    <Icon icon="solar:arrow-right-bold-duotone" className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">{val.after}</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-700 mt-1 block">{JSON.stringify(val)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContextDetails = (details: any) => {
    const entries = Object.entries(details).filter(([k, v]) => {
      if (v && typeof v === "object" && "before" in v && "after" in v) return false;
      if (k === "status" && v && typeof v === "object" && "before" in v) return false;
      return true;
    });

    if (entries.length === 0) return null;

    return (
      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Metadata / Context</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {entries.map(([key, value]) => {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            return (
              <div key={key} className="flex justify-between items-center p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <span className="text-slate-500 font-bold">{label}:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[70%]" title={String(value)}>{String(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-[#1F2937]">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">System Audit Logs</h2>
          <p className="text-[#4B5563] mt-2 font-medium">Review real-time system activities, user configuration updates, and security events.</p>
        </div>
        
        {/* Fetch Controls */}
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-2xl border border-white/60 shadow-md bg-white/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
          >
            <option value={20}>20 database logs</option>
            <option value={50}>50 database logs</option>
            <option value={100}>100 database logs</option>
            <option value={200}>200 database logs</option>
          </select>
          <Button 
            onClick={() => refetch()} 
            className="bg-[#00A651] hover:bg-[#008F44] text-white px-5 py-5 rounded-2xl shadow-md hover:shadow-lg font-bold transition-all flex items-center gap-2"
            disabled={isFetching || isLoading}
          >
            <Icon icon="solar:refresh-bold-duotone" className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Syncing..." : "Sync Logs"}
          </Button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-[#4B5563] uppercase tracking-wider">Total Feed Events</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
              <Icon icon="solar:pulse-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1F2937] mt-4">{stats.total}</div>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Total system events logged</span>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">System Activities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-4">{stats.activities}</div>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Approvals, reports & logins</span>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Configuration Updates</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Icon icon="solar:settings-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 mt-4">{stats.updates}</div>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Export cases & cost configs</span>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all border-rose-200">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Security Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
              <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-700 mt-4">{stats.alerts}</div>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Critical events & failed logins</span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 space-y-4">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Icon icon="solar:magnifer-bold-duotone" className="absolute left-4 top-3.5 h-4 w-4 text-[#9CA3AF]" />
            <input 
              type="text"
              placeholder="Search by Actor, Case ID, Company, Action, Metadata, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white text-sm font-semibold"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="rounded-2xl px-5 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 flex items-center gap-2"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Dropdown Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          {/* Date Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Date Period</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold text-[#4B5563] bg-white focus:outline-none focus:ring-2 focus:ring-[#00A651]"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {/* Company/Tenant Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Company / Tenant</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold text-[#4B5563] bg-white focus:outline-none focus:ring-2 focus:ring-[#00A651]"
            >
              <option value="All">All Tenants</option>
              {uniqueCompanies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Module Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">System Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold text-[#4B5563] bg-white focus:outline-none focus:ring-2 focus:ring-[#00A651]"
            >
              <option value="All">All Modules</option>
              <option value="Company">Company</option>
              <option value="Export Case">Export Case</option>
              <option value="Finance">Finance</option>
              <option value="Document">Document</option>
              <option value="AI">AI Advisor</option>
              <option value="User">User Account</option>
              <option value="System">System Admin</option>
            </select>
          </div>

          {/* Severity Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Alert Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold text-[#4B5563] bg-white focus:outline-none focus:ring-2 focus:ring-[#00A651]"
            >
              <option value="All">All Severities</option>
              <option value="None">None</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs (Conditional) */}
        {dateFilter === "Custom" && (
          <div className="flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">From:</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-gray-200 p-2 text-xs font-bold text-[#4B5563]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">To:</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-gray-200 p-2 text-xs font-bold text-[#4B5563]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Timeline View */}
      {isLoading ? (
        <div className="p-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>
      ) : error ? (
        <div className="p-16 text-center text-rose-500 font-bold bg-white/95 rounded-3xl shadow-lg border border-white">
          {(error as any)?.message || "Failed to load system audit logs."}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white/90 backdrop-blur-xl rounded-3xl border border-white shadow-xl text-center">
          <Icon icon="solar:danger-triangle-bold-duotone" className="w-10 h-10 text-amber-500 mb-3" />
          <p className="font-extrabold text-lg text-gray-700">No activity events match your active filters.</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">Try resetting the search keywords or selecting a broader date range.</p>
          <Button onClick={resetFilters} className="mt-4 bg-[#00A651] hover:bg-[#008F44]">Reset Filters</Button>
        </div>
      ) : (
        <div className="space-y-8 relative">
          
          {/* Vertical Timeline Background Line */}
          <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-slate-200/80 pointer-events-none"></div>

          {/* Group logs by day keys */}
          {dayKeys.map((day) => {
            const items = daySections[day];
            if (!items || items.length === 0) return null;

            return (
              <div key={day} className="space-y-4">
                
                {/* Day Header */}
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-[60px] flex justify-center shrink-0">
                    <div className="bg-slate-100 border border-slate-200 text-slate-500 font-extrabold text-[10px] tracking-wider px-3 py-1 rounded-full uppercase shadow-xs">
                      {day}
                    </div>
                  </div>
                </div>

                {/* Day's Events List */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const isExpanded = expandedItems[item.id] || false;
                    const timestamp = new Date(item.timestamp);
                    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    
                    const clr = getActionColors(item.action);

                    return (
                      <div key={item.id} className="relative z-10 flex items-start gap-6">
                        
                        {/* Dot indicator aligned with timeline */}
                        <div className="w-[60px] flex justify-center shrink-0 mt-3.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${clr.dot} ring-4 border-2 border-white flex items-center justify-center`}></div>
                        </div>

                        {/* Event Card */}
                        <div className={`flex-1 rounded-3xl bg-white border ${isExpanded ? "border-slate-300 shadow-xl" : "border-slate-150 shadow-sm hover:shadow-md hover:border-slate-300"} transition-all duration-200 overflow-hidden`}>
                          
                          {/* Compact Row */}
                          <div 
                            onClick={() => toggleExpand(item.id)}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Time */}
                                <span className="text-xs font-extrabold text-slate-400 font-mono tracking-wider">{formattedTime}</span>
                                
                                {/* Severity Badge */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] border tracking-wider uppercase ${getSeverityBadge(item.severity)}`}>
                                  {item.severity} {item.cvss.toFixed(1)}
                                </span>

                                {/* Module Badge */}
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold text-slate-500 bg-slate-50 border border-slate-200 uppercase">
                                  {getModuleIcon(item.module)}
                                  {item.module}
                                </span>
                              </div>

                              {/* Friendly Action Name */}
                              <h4 className="font-extrabold text-[#1F2937] text-sm md:text-base flex items-center gap-2">
                                {item.friendlyName}
                                {item.isGroup && (
                                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                    Grouped Activity
                                  </span>
                                )}
                              </h4>

                              {/* Actor Description */}
                              <p className="text-xs text-gray-500 font-semibold">
                                Initiated by <span className="text-[#00A651] font-bold">{item.actorName}</span> ({item.actorRole})
                              </p>
                            </div>

                            {/* Right side controls */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${clr.badge}`}>
                                {item.action}
                              </span>
                              <div className="text-gray-400 group-hover:text-gray-600">
                                {isExpanded ? <Icon icon="solar:box-bold-duotone" className="w-5 h-5" /> : <Icon icon="solar:alt-arrow-down-bold-duotone" className="w-5 h-5" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details Panel */}
                          {isExpanded && (
                            <div className="px-5 pb-5 border-t border-slate-100 pt-4 bg-slate-50/20 animate-in slide-in-from-top-2 duration-200">
                              
                              {/* If it's a Grouped Log */}
                              {item.isGroup ? (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center bg-amber-50/50 border border-amber-200/50 p-3 rounded-2xl">
                                    <p className="text-xs font-bold text-amber-800">
                                      This timeline entry consolidates {item.logs.length} consecutive {item.action} updates on {item.resource} within a short timeframe.
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                                    {item.logs.map((subLog, index) => (
                                      <div key={subLog.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-extrabold text-slate-400 font-mono">
                                            {new Date(subLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                          </span>
                                          <span className="text-xs font-bold text-slate-700">Update #{index + 1} (CVSS {subLog.cvss.toFixed(1)})</span>
                                        </div>
                                        {renderDetailsDiff(subLog.details)}
                                        {renderContextDetails(subLog.details)}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Consolidated Metadata Info */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">Actor Name</span>
                                      <span className="text-[#1F2937] font-bold">{item.actorName}</span>
                                      <span className="text-[#9CA3AF] block text-[9px] font-bold">{item.actorRole}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">Tenant Company</span>
                                      <span className="text-[#1F2937] font-bold">{item.companyName}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">IP Endpoint</span>
                                      <span className="text-[#1F2937] font-mono font-bold">{item.logs[0]?.ip || "Unknown"}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">Browser Agent</span>
                                      <span className="text-[#1F2937] font-bold truncate block" title={item.logs[0]?.browser}>{item.logs[0]?.browser || "Unknown"}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // If it is a Single Log
                                <div className="space-y-4">
                                  
                                  {/* Custom specific details based on log type */}
                                  {renderDetailsDiff(item.log.details)}
                                  
                                  {/* Render custom metadata details */}
                                  {renderContextDetails(item.log.details)}

                                  {/* Standard Client Info Box */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">Actor Name</span>
                                      <span className="text-[#1F2937] font-bold">{item.actorName}</span>
                                      <span className="text-[#9CA3AF] block text-[9px] font-bold">{item.actorRole}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">Tenant Company</span>
                                      <span className="text-[#1F2937] font-bold">{item.companyName}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">IP Endpoint</span>
                                      <span className="text-[#1F2937] font-mono font-bold">{item.log.ip}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#9CA3AF] font-bold block uppercase tracking-wider text-[10px]">Browser Agent</span>
                                      <span className="text-[#1F2937] font-bold truncate block" title={item.log.browser}>{item.log.browser}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
