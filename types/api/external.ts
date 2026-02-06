/**
 * External API Response Types
 *
 * Type definitions for external API integrations
 */

// ============================================
// OPENAI / AI COACH TYPES
// ============================================

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenAIChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: "stop" | "length" | "content_filter" | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// ============================================
// ANTHROPIC / CLAUDE TYPES
// ============================================

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

export interface AnthropicResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{
    type: "text";
    text: string;
  }>;
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ============================================
// CLERK TYPES
// ============================================

export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
    verification: {
      status: string;
    };
  }>;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClerkSession {
  id: string;
  userId: string;
  status: "active" | "ended" | "abandoned" | "removed";
  lastActiveAt: number;
  expireAt: number;
  abandonAt: number;
}

// ============================================
// FILE UPLOAD / STORAGE TYPES
// ============================================

export interface FileUploadResponse {
  url: string;
  storageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface FileUploadError {
  code: "FILE_TOO_LARGE" | "INVALID_FILE_TYPE" | "UPLOAD_FAILED";
  message: string;
  maxSize?: number;
  allowedTypes?: string[];
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WebhookPayload<T = unknown> {
  id: string;
  type: string;
  created: number;
  data: T;
}

export interface WebhookVerification {
  verified: boolean;
  timestamp: number;
  signature: string;
}

// ============================================
// THIRD-PARTY INTEGRATIONS
// ============================================

// Example: Google Calendar
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status: "confirmed" | "tentative" | "cancelled";
}

// Example: Notion
export interface NotionPage {
  id: string;
  object: "page";
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
}

// Example: Stripe (if payment features are added)
export interface StripeSubscription {
  id: string;
  status: "active" | "past_due" | "canceled" | "unpaid";
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}
