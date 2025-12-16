// Clinic appointment system type definitions
// This file contains all shared types used across the application

/**
 * Doctor type
 */
export type Doctor = {
  id: string;
  name: string;
  specialization?: string;
  phone?: string;
  email?: string;
};

/**
 * Patient type
 */
export type Patient = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  birthYear?: number;
  notes?: string;
};

/**
 * Appointment type
 */
export type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  doctorId: string;
  patientId: string;
  reason?: string;
  status?: "scheduled" | "completed" | "cancelled";
};

/**
 * BlockedSlot type - for vacation or blocked times
 */
export type BlockedSlot = {
  id: string;
  date: string; // YYYY-MM-DD
  doctorId: string;
  time: string; // HH:MM
  reason?: string;
};

/**
 * PatientFile type - for medical records
 */
export type PatientFileKind = "xray" | "mr" | "prescription" | "report" | "other";

export type PatientFile = {
  id: string;
  patientId: string;
  kind: PatientFileKind;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string; // ISO string
  url: string;
  note?: string;
};

/**
 * Chat message type
 */
export type ChatMessage = {
  id: string;
  appointmentId: string;
  from: "doctor" | "patient";
  text: string;
  timestamp: string; // ISO string
  isRead?: boolean;
};

/**
 * API Response types
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

/**
 * API Request with Idempotency
 */
export type IdempotentRequest<T> = {
  data: T;
  idempotencyKey: string; // UUID v4
};

/**
 * Responsive viewport size
 */
export type ViewportSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Theme type
 */
export type Theme = "light" | "dark";

/**
 * Slot status
 */
export type SlotStatus = "empty" | "booked" | "locked";

/**
 * Pagination
 */
export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
