"use client";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { useEffect } from "react";


export default function PusherProbe({ projectId }: { projectId: number }) {
  useEffect(() => {
    const channelName = `presence-project-${projectId}`;
    const ch = pusherClient.subscribe(channelName);

    ch.bind("pusher:subscription_succeeded", (members: unknown) => {
      console.log("presence connected. members:", members);
    });

    ch.bind("pusher:member_added", (member: unknown) => {
      console.log("added member", member);
    });

    ch.bind("pusher:member_removed", (member: unknown) => {
      console.log("minus member", member);
    });

    return () => {
      ch.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [projectId]);

  return null;
}
