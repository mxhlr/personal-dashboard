/**
 * API Types Test Suite
 *
 * Tests to ensure type safety and correctness of API types
 */

import { describe, it, expect } from "@jest/globals";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  type ApiResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from "../common";
import { isSuccessResponse, isErrorResponse } from "@/lib/api/client";

describe("API Response Types", () => {
  describe("createSuccessResponse", () => {
    it("should create a success response with correct structure", () => {
      const data = { id: "123", name: "Test" };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
      expect(typeof response.timestamp).toBe("string");
    });

    it("should handle different data types", () => {
      const stringResponse = createSuccessResponse("test");
      expect(stringResponse.data).toBe("test");

      const numberResponse = createSuccessResponse(42);
      expect(numberResponse.data).toBe(42);

      const arrayResponse = createSuccessResponse([1, 2, 3]);
      expect(arrayResponse.data).toEqual([1, 2, 3]);

      const nullResponse = createSuccessResponse(null);
      expect(nullResponse.data).toBeNull();
    });
  });

  describe("createErrorResponse", () => {
    it("should create an error response with correct structure", () => {
      const response = createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Resource not found"
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.NOT_FOUND);
      expect(response.error.message).toBe("Resource not found");
      expect(response.timestamp).toBeDefined();
    });

    it("should include details when provided", () => {
      const details = { resourceId: "123", resourceType: "user" };
      const response = createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Resource not found",
        details
      );

      expect(response.error.details).toEqual(details);
    });

    it("should handle all error codes", () => {
      const codes = Object.values(ErrorCode);

      codes.forEach((code) => {
        const response = createErrorResponse(
          code as ErrorCode,
          `Test ${code}`
        );
        expect(response.error.code).toBe(code);
      });
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify success responses", () => {
      const successResponse: ApiResponse<string> =
        createSuccessResponse("test");
      const errorResponse: ApiResponse<string> = createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Error"
      );

      expect(isSuccessResponse(successResponse)).toBe(true);
      expect(isSuccessResponse(errorResponse)).toBe(false);
    });

    it("should correctly identify error responses", () => {
      const successResponse: ApiResponse<string> =
        createSuccessResponse("test");
      const errorResponse: ApiResponse<string> = createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Error"
      );

      expect(isErrorResponse(successResponse)).toBe(false);
      expect(isErrorResponse(errorResponse)).toBe(true);
    });

    it("should narrow types correctly", () => {
      const response: ApiResponse<{ id: string }> = createSuccessResponse({
        id: "123",
      });

      if (isSuccessResponse(response)) {
        // TypeScript should know response.data exists
        expect(response.data.id).toBe("123");
        // @ts-expect-error - error should not exist on success response
        expect(response.error).toBeUndefined();
      }
    });
  });

  describe("Error Codes", () => {
    it("should have all expected error codes", () => {
      expect(ErrorCode.UNAUTHORIZED).toBe("UNAUTHORIZED");
      expect(ErrorCode.FORBIDDEN).toBe("FORBIDDEN");
      expect(ErrorCode.NOT_FOUND).toBe("NOT_FOUND");
      expect(ErrorCode.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
      expect(ErrorCode.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
      expect(ErrorCode.UNKNOWN).toBe("UNKNOWN");
    });
  });

  describe("Type Compatibility", () => {
    it("should work with union types", () => {
      const responses: ApiResponse<number>[] = [
        createSuccessResponse(42),
        createErrorResponse(ErrorCode.NOT_FOUND, "Not found"),
        createSuccessResponse(100),
      ];

      const successCount = responses.filter(isSuccessResponse).length;
      const errorCount = responses.filter(isErrorResponse).length;

      expect(successCount).toBe(2);
      expect(errorCount).toBe(1);
    });

    it("should maintain type information through arrays", () => {
      const successResponses = [
        createSuccessResponse({ id: 1, name: "One" }),
        createSuccessResponse({ id: 2, name: "Two" }),
      ];

      successResponses.forEach((response) => {
        expect(response.success).toBe(true);
        expect(response.data.id).toBeDefined();
        expect(response.data.name).toBeDefined();
      });
    });
  });

  describe("Timestamp Validation", () => {
    it("should create valid ISO timestamps", () => {
      const response = createSuccessResponse({ test: true });
      const timestamp = new Date(response.timestamp!);

      expect(timestamp instanceof Date).toBe(true);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it("should have recent timestamps", () => {
      const response = createSuccessResponse({ test: true });
      const timestamp = new Date(response.timestamp!);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();

      // Timestamp should be within 1 second of now
      expect(diffMs).toBeLessThan(1000);
    });
  });
});

describe("Generic Type Parameters", () => {
  interface TestUser {
    id: string;
    name: string;
    email: string;
  }

  it("should preserve complex type structures", () => {
    const user: TestUser = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
    };

    const response = createSuccessResponse(user);

    // TypeScript should infer correct types
    expect(response.data.id).toBe("123");
    expect(response.data.name).toBe("John Doe");
    expect(response.data.email).toBe("john@example.com");
  });

  it("should work with nested types", () => {
    interface NestedData {
      user: TestUser;
      metadata: {
        createdAt: string;
        updatedAt: string;
      };
    }

    const data: NestedData = {
      user: {
        id: "123",
        name: "John",
        email: "john@example.com",
      },
      metadata: {
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      },
    };

    const response = createSuccessResponse(data);

    expect(response.data.user.name).toBe("John");
    expect(response.data.metadata.createdAt).toBe("2024-01-01");
  });

  it("should work with arrays of complex types", () => {
    const users: TestUser[] = [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ];

    const response = createSuccessResponse(users);

    expect(response.data.length).toBe(2);
    expect(response.data[0].name).toBe("Alice");
    expect(response.data[1].name).toBe("Bob");
  });
});

describe("API Response Edge Cases", () => {
  it("should handle empty objects", () => {
    const response = createSuccessResponse({});
    expect(response.data).toEqual({});
  });

  it("should handle empty arrays", () => {
    const response = createSuccessResponse([]);
    expect(response.data).toEqual([]);
  });

  it("should handle undefined in details", () => {
    const response = createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      { field: undefined }
    );

    expect(response.error.details?.field).toBeUndefined();
  });

  it("should handle very long error messages", () => {
    const longMessage = "Error: " + "x".repeat(1000);
    const response = createErrorResponse(ErrorCode.INTERNAL_ERROR, longMessage);

    expect(response.error.message.length).toBeGreaterThan(1000);
  });
});
