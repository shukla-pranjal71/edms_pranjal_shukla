
// Helper utility to cast types safely for service responses

import { ChangeRequestStatus } from "@/components/ChangeRequestForm";

export const safeCastRequestType = (requestType: string): "minor" | "major" => {
  return (requestType === "major") ? "major" : "minor";
};

export const safeCastChangeStatus = (status: string): ChangeRequestStatus => {
  if (status === "approved" || status === "rejected" || status === "completed") {
    return status as ChangeRequestStatus;
  }
  return "pending";
};

// String conversion utility for JSON fields
export const safeJsonToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return '';
};
