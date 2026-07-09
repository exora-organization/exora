package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"github.com/exora/backend/internal/apperror"
)

type ipLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*ipLimiter
	r        rate.Limit
	b        int
}

func NewRateLimiter(r rate.Limit, b int) *RateLimiter {
	lim := &RateLimiter{
		limiters: make(map[string]*ipLimiter),
		r:        r,
		b:        b,
	}
	// Start a cleanup goroutine to prevent memory leaks
	go lim.cleanupLoop()
	return lim
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			// fallback to remote addr directly if SplitHostPort fails
			ip = r.RemoteAddr
		}

		rl.mu.Lock()
		lim, exists := rl.limiters[ip]
		if !exists {
			lim = &ipLimiter{
				limiter: rate.NewLimiter(rl.r, rl.b),
			}
			rl.limiters[ip] = lim
		}
		lim.lastSeen = time.Now()
		rl.mu.Unlock()

		if !lim.limiter.Allow() {
			apperror.Write(w, apperror.ErrRateLimited)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(1 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		for ip, lim := range rl.limiters {
			if time.Since(lim.lastSeen) > 3*time.Minute {
				delete(rl.limiters, ip)
			}
		}
		rl.mu.Unlock()
	}
}
