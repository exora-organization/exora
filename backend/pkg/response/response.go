package response

import (
	"encoding/json"
	"net/http"

	"github.com/exora/backend/internal/apperror"
)

type Success struct {
	Success bool `json:"success"`
	Data    any  `json:"data"`
}

type Paginated struct {
	Items      any     `json:"items"`
	NextCursor *string `json:"nextCursor"`
}

func JSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(Success{Success: true, Data: data})
}

func PaginatedJSON(w http.ResponseWriter, status int, items any, nextCursor *string) {
	JSON(w, status, Paginated{Items: items, NextCursor: nextCursor})
}

func Error(w http.ResponseWriter, err error) {
	apperror.Write(w, err)
}
