package firestore

import (
	"context"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

type Client struct {
	*firestore.Client
}

func NewClient(ctx context.Context, projectID, credentialsPath string) (*Client, error) {
	opts := []option.ClientOption{}
	if credentialsPath != "" {
		opts = append(opts, option.WithCredentialsFile(credentialsPath))
	}

	client, err := firestore.NewClient(ctx, projectID, opts...)
	if err != nil {
		return nil, err
	}
	return &Client{Client: client}, nil
}

func (c *Client) Close() error {
	return c.Client.Close()
}
