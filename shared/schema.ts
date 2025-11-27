import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  interests: jsonb("interests").default([]),
  companions: jsonb("companions").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedPlaces = pgTable("saved_places", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id),
  yelpBusinessId: text("yelp_business_id").notNull(),
  businessName: text("business_name").notNull(),
  businessData: jsonb("business_data"),
  customNotes: text("custom_notes"),
  dayOrder: integer("day_order"),
  aiReason: text("ai_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTripSchema = createInsertSchema(trips).pick({
  name: true,
  location: true,
  interests: true,
  companions: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type SavedPlace = typeof savedPlaces.$inferSelect;
