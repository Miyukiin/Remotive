"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { channelName, EVENTS } from "./pusher-utils";

export function useRealtimeInvalidation(projectKey: number) {
  const qc = useQueryClient();
  const chan = useMemo(() => channelName(projectKey), [projectKey]);

  useEffect(() => {
    const ch = pusherClient.subscribe(chan);

    ch.bind(EVENTS.TASKS_UPDATED, () => {
      qc.invalidateQueries({ queryKey: ["tasks_list", projectKey] });
      qc.invalidateQueries({ queryKey: ["tasks_project", projectKey] });
    });
    ch.bind(EVENTS.LISTS_UPDATED, () => qc.invalidateQueries({ queryKey: ["lists", projectKey] }));

    return () => {
      ch.unbind(EVENTS.TASKS_UPDATED);
      ch.unbind(EVENTS.LISTS_UPDATED);
      pusherClient.unsubscribe(chan);
    };
  }, [chan, projectKey, qc]);
}
