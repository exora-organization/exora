package firebaseauth

import (
	"context"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type Client struct {
	Auth *auth.Client
}

func NewClient(ctx context.Context, credentialsPath string) (*Client, error) {
	opts := []option.ClientOption{}
	if credentialsPath != "" {
		opts = append(opts, option.WithCredentialsFile(credentialsPath))
	}

	app, err := firebase.NewApp(ctx, nil, opts...)
	if err != nil {
		return nil, err
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	return &Client{Auth: authClient}, nil
}

func (c *Client) VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	return c.Auth.VerifyIDToken(ctx, idToken)
}
