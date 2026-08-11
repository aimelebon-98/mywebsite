// route: fb-capi/track (cache bust 2026-08-11T19:15:47.7602167+00:00)
import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvents, extractUserDataFromHeaders, type CapiEvent } from "@/lib/fb-capi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientEvents = Array.isArray(body?.events) ? body.events : [];
    if (clientEvents.length === 0) {
      return NextResponse.json({ ok: false, error: "No events" }, { status: 400 });
    }

    const serverUserData = extractUserDataFromHeaders(req.headers);

    const events: CapiEvent[] = clientEvents.map((e: {
      eventName?: string; event_name?: string;
      eventId?: string; event_id?: string;
      eventSourceUrl?: string; event_source_url?: string;
      userData?: Record<string, unknown>; user_data?: Record<string, unknown>;
      customData?: Record<string, unknown>; custom_data?: Record<string, unknown>;
    }) => {
      const eventName = e.eventName || e.event_name || "";
      const eventId = e.eventId || e.event_id;
      const eventSourceUrl = e.eventSourceUrl || e.event_source_url;
      const clientUserData = (e.userData || e.user_data || {}) as Record<string, unknown>;
      const customData = (e.customData || e.custom_data || {}) as Record<string, unknown>;
      return {
        eventName, eventId, eventSourceUrl,
        userData: { ...serverUserData, ...clientUserData },
        customData,
      };
    }).filter((e: CapiEvent) => e.eventName);

    const result = await sendCapiEvents(events);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}