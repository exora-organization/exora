export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}
