import { pusherServer } from "@/lib/pusher/pusher-server";
import { channelName, EVENTS } from "./pusher-utils";

// SERVER ONLY, TRIGGERS A BROADCAST
export async function broadcastProjectEvent(projectKey: number, event: keyof typeof EVENTS) {
  await pusherServer.trigger(channelName(projectKey), EVENTS[event], {});
}
