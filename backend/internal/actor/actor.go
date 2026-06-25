package actor

import "context"

type FirebaseClaims struct {
	UID   string
	Email string
}

type User struct {
	ID          string
	FirebaseUID string
	Email       string
	DisplayName string
	Role        string
	CompanyID   string
	Status      string
}

type ctxKey int

const (
	keyClaims ctxKey = iota
	keyUser
)

func WithClaims(ctx context.Context, c *FirebaseClaims) context.Context {
	return context.WithValue(ctx, keyClaims, c)
}

func ClaimsFromContext(ctx context.Context) (*FirebaseClaims, bool) {
	c, ok := ctx.Value(keyClaims).(*FirebaseClaims)
	return c, ok
}

func WithUser(ctx context.Context, u *User) context.Context {
	return context.WithValue(ctx, keyUser, u)
}

func FromContext(ctx context.Context) (*User, bool) {
	u, ok := ctx.Value(keyUser).(*User)
	return u, ok
}
