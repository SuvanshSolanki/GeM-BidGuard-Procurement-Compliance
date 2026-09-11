import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appSnapshots = pgTable("app_snapshots", {
  id: text("id").primaryKey(),
  snapshot: jsonb("snapshot").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
