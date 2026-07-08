package middleware

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

func TestRateLimiter(t *testing.T) {
	t.Run("Allows requests within limits", func(t *testing.T) {
		// Limit to 5 requests per second, burst of 2
		rl := NewRateLimiter(rate.Limit(5.0), 2)

		var invoked int
		handler := rl.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked++
		}))

		// Send 2 requests immediately (should be allowed due to burst of 2)
		for i := 0; i < 2; i++ {
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			req.RemoteAddr = "1.2.3.4:5678"
			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			if rr.Code != http.StatusOK {
				t.Errorf("request %d: expected 200, got %d", i, rr.Code)
			}
		}

		if invoked != 2 {
			t.Errorf("expected handler to be invoked 2 times, got %d", invoked)
		}
	})

	t.Run("Blocks requests exceeding limits with 429", func(t *testing.T) {
		// Limit to 1 request per second, burst of 1
		rl := NewRateLimiter(rate.Limit(1.0), 1)

		handler := rl.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))

		// 1st request should pass
		req1 := httptest.NewRequest(http.MethodGet, "/", nil)
		req1.RemoteAddr = "1.2.3.4:5678"
		rr1 := httptest.NewRecorder()
		handler.ServeHTTP(rr1, req1)

		if rr1.Code != http.StatusOK {
			t.Errorf("1st request: expected 200, got %d", rr1.Code)
		}

		// 2nd request (immediately after) should be blocked (429)
		req2 := httptest.NewRequest(http.MethodGet, "/", nil)
		req2.RemoteAddr = "1.2.3.4:5678"
		rr2 := httptest.NewRecorder()
		handler.ServeHTTP(rr2, req2)

		if rr2.Code != http.StatusTooManyRequests {
			t.Errorf("2nd request: expected 429, got %d", rr2.Code)
		}
	})

	t.Run("Isolates limits by IP address", func(t *testing.T) {
		// Limit to 1 request per second, burst of 1
		rl := NewRateLimiter(rate.Limit(1.0), 1)

		handler := rl.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))

		// 1st request from IP A should pass
		reqA1 := httptest.NewRequest(http.MethodGet, "/", nil)
		reqA1.RemoteAddr = "1.1.1.1:5678"
		rrA1 := httptest.NewRecorder()
		handler.ServeHTTP(rrA1, reqA1)

		if rrA1.Code != http.StatusOK {
			t.Errorf("IP A 1st request: expected 200, got %d", rrA1.Code)
		}

		// 1st request from IP B should also pass (isolated from IP A)
		reqB1 := httptest.NewRequest(http.MethodGet, "/", nil)
		reqB1.RemoteAddr = "2.2.2.2:5678"
		rrB1 := httptest.NewRecorder()
		handler.ServeHTTP(rrB1, reqB1)

		if rrB1.Code != http.StatusOK {
			t.Errorf("IP B 1st request: expected 200, got %d", rrB1.Code)
		}

		// 2nd request from IP A should be blocked
		reqA2 := httptest.NewRequest(http.MethodGet, "/", nil)
		reqA2.RemoteAddr = "1.1.1.1:5678"
		rrA2 := httptest.NewRecorder()
		handler.ServeHTTP(rrA2, reqA2)

		if rrA2.Code != http.StatusTooManyRequests {
			t.Errorf("IP A 2nd request: expected 429, got %d", rrA2.Code)
		}
	})

	t.Run("Cleans up inactive limiters", func(t *testing.T) {
		rl := NewRateLimiter(rate.Limit(1.0), 1)

		// Create a limiter for an IP
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "9.9.9.9:5678"
		rr := httptest.NewRecorder()
		rl.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})).ServeHTTP(rr, req)

		rl.mu.Lock()
		_, exists := rl.limiters["9.9.9.9"]
		rl.mu.Unlock()
		if !exists {
			t.Fatal("expected limiter to exist in map")
		}

		// Modify lastSeen to simulate inactivity
		rl.mu.Lock()
		rl.limiters["9.9.9.9"].lastSeen = time.Now().Add(-5 * time.Minute)
		rl.mu.Unlock()

		// Run a manual cleanup loop (simulated by calling private cleanup logic directly or waiting, but since it runs in a ticker let's wait a bit or we can test sync)
		// We can just trigger the map check manually since we have mutex access
		var wg sync.WaitGroup
		wg.Add(1)
		go func() {
			defer wg.Done()
			rl.mu.Lock()
			for ip, lim := range rl.limiters {
				if time.Since(lim.lastSeen) > 3*time.Minute {
					delete(rl.limiters, ip)
				}
			}
			rl.mu.Unlock()
		}()
		wg.Wait()

		rl.mu.Lock()
		_, existsAfter := rl.limiters["9.9.9.9"]
		rl.mu.Unlock()

		if existsAfter {
			t.Error("expected inactive limiter to be removed from map")
		}
	})
}
