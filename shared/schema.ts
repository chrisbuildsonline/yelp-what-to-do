import { z } from "zod";

// User types
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  interests: any[];
  companions: any[];
  createdAt: Date;
}

export interface SavedPlace {
  id: string;
  tripId: string;
  yelpBusinessId: string;
  businessName: string;
  businessData: any;
  customNotes: string | null;
  dayOrder: number | null;
  aiReason: string | null;
  createdAt: Date;
}

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
});

export const insertTripSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1),
  interests: z.array(z.any()).optional(),
  companions: z.array(z.any()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
