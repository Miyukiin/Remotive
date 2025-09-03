"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { ListsReorderedEvent } from "@/types";

export function useProjectListRealtime(
  projectId: number,
  actorClerkId: string | null | undefined,
  onReordered: (ids: number[]) => void,
) {
  useEffect(() => {
    if (!projectId) return;
    const channelName = `presence-project-${projectId}`;
    const ch = pusherClient.subscribe(channelName); // open conneciton

    const handler = (evt: ListsReorderedEvent) => {
      if (!evt) return;
      // Ignore your own echo — cuz you already optimistically updated
      if (actorClerkId && evt.actorClerkId === actorClerkId) return;
      onReordered(evt.reorderedListIds);
    };

    ch.bind("lists:reordered", handler);

    return () => {
      ch.unbind("lists:reordered", handler);
      pusherClient.unsubscribe(channelName);
    };
  }, [projectId, actorClerkId, onReordered]);
}
