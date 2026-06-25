package admin

import "time"

type MonitoringStats struct {
	TotalCompanies        int                `json:"totalCompanies"`
	TotalUsers            int                `json:"totalUsers"`
	TotalExportCases      int                `json:"totalExportCases"`
	PendingApprovals      int                `json:"pendingApprovals"`
	ActiveUsersLast30Days int                `json:"activeUsersLast30Days"`
	AIUsageCount          int                `json:"aiUsageCount"`
	UserActivityStats     UserActivityStats  `json:"userActivityStats"`
}

type UserActivityStats struct {
	LoginsLast7Days      int `json:"loginsLast7Days"`
	CasesCreatedLast7Days int `json:"casesCreatedLast7Days"`
}

type AuditLog struct {
	ID        string    `json:"-" firestore:"-"`
	ActorID   string    `json:"actorId" firestore:"actorId"`
	Action    string    `json:"action" firestore:"action"`
	Resource  string    `json:"resource" firestore:"resource"`
	Details   any       `json:"details,omitempty" firestore:"details,omitempty"`
	Timestamp time.Time `json:"timestamp" firestore:"timestamp"`
}
