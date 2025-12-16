// API utilities with Idempotency support
import { useIdempotencyKey } from "./hooks";

/**
 * Make API request with Idempotency Key
 * Used for POST/PUT/DELETE operations
 */
export async function apiCall<T = unknown>(
  url: string,
  options: RequestInit & {
    idempotencyKey?: string;
  } = {}
): Promise<T> {
  const { idempotencyKey, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  // Add Idempotency Key for POST/PUT/DELETE requests
  if (
    idempotencyKey &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(fetchOptions.method ?? "GET")
  ) {
    headers.set("X-Idempotency-Key", idempotencyKey);
  }

  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * GET request wrapper
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  return apiCall<T>(url, { method: "GET" });
}

/**
 * POST request wrapper with Idempotency
 */
export async function apiPost<T = unknown>(
  url: string,
  data: unknown,
  idempotencyKey?: string
): Promise<T> {
  return apiCall<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    idempotencyKey: idempotencyKey || generateUUID(),
  });
}

/**
 * PUT request wrapper with Idempotency
 */
export async function apiPut<T = unknown>(
  url: string,
  data: unknown,
  idempotencyKey?: string
): Promise<T> {
  return apiCall<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    idempotencyKey: idempotencyKey || generateUUID(),
  });
}

/**
 * PATCH request wrapper with Idempotency
 */
export async function apiPatch<T = unknown>(
  url: string,
  data: unknown,
  idempotencyKey?: string
): Promise<T> {
  return apiCall<T>(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    idempotencyKey: idempotencyKey || generateUUID(),
  });
}

/**
 * DELETE request wrapper with Idempotency
 */
export async function apiDelete<T = unknown>(
  url: string,
  idempotencyKey?: string
): Promise<T> {
  return apiCall<T>(url, {
    method: "DELETE",
    idempotencyKey: idempotencyKey || generateUUID(),
  });
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Retry helper for failed requests
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
}
