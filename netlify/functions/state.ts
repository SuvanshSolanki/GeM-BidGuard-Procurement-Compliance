import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { appSnapshots } from "../../db/schema.js";

const DEMO_ID = "gem-bidguard-demo";

export default async function handler(request: Request) {
  if (request.method === "GET") {
    const [record] = await db.select().from(appSnapshots).where(eq(appSnapshots.id, DEMO_ID)).limit(1);
    return Response.json(record ?? { snapshot: null });
  }

  if (request.method === "POST") {
    const body = await request.json() as { snapshot?: unknown };
    if (!body.snapshot) return Response.json({ error: "Snapshot is required" }, { status: 400 });
    const snapshot = body.snapshot as any;
    const [record] = await db.insert(appSnapshots).values({ id: DEMO_ID, snapshot, updatedAt: new Date() })
      .onConflictDoUpdate({ target: appSnapshots.id, set: { snapshot, updatedAt: new Date() } }).returning();
    return Response.json({ saved: true, updatedAt: record.updatedAt });
  }

  if (request.method === "DELETE") {
    await db.delete(appSnapshots).where(eq(appSnapshots.id, DEMO_ID));
    return Response.json({ reset: true });
  }

  return new Response("Method not allowed", { status: 405 });
}

export const config: Config = { path: "/api/state" };
