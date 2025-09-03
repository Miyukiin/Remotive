export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher/pusher-server";

/**
 * Pusher JS will POST here automatically when subscribing to private/presence channels.
 * Body: { socket_id, channel_name }
 * Ref: https://pusher.com/docs/channels/server_api/authenticating-users/
 */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  //  console.log(req);

  // https://pusher.com/docs/channels/server_api/authorizing-users/#response
  const data = await req.formData();
  // console.log(await req.formData())
  const socket_id = data.get("socket_id") as string;
  const channel_name = data.get("channel_name") as string;

  // Presence Channel, attach necessary info to identify this user
  const presenceData = {
    user_id: user.id,
    user_info: {
      name: user.fullName ?? user.username ?? "Unknown",
      avatar: user.imageUrl ?? "",
    },
  };

  // Use presence data only when channel_name starts with 'presence-'
  const auth = channel_name?.startsWith("presence-")
    ? pusherServer.authorizeChannel(socket_id, channel_name, presenceData)
    : pusherServer.authorizeChannel(socket_id, channel_name);

  return NextResponse.json(auth);
}
