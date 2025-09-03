"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { channelName, EVENTS } from "./pusher-utils";
import { useTaskStore } from "@/stores/task-store";

export function useRealtimeInvalidation(projectKey: number) {
  const qc = useQueryClient();
  const chan = useMemo(() => channelName(projectKey), [projectKey]);

  const { activeTask } = useTaskStore();
  const taskKey = activeTask ? activeTask.id : null;

  useEffect(() => {
    const ch = pusherClient.subscribe(chan);

    ch.bind(EVENTS.TASKS_UPDATED, () => {
      qc.invalidateQueries({ queryKey: ["tasks_list", projectKey] });
      qc.invalidateQueries({ queryKey: ["tasks_project", projectKey] });
    });
    ch.bind(EVENTS.LISTS_UPDATED, () => qc.invalidateQueries({ queryKey: ["lists", projectKey] }));
    ch.bind(EVENTS.COMMENTS_UPDATED, () => {
      if (taskKey != null) {
        qc.invalidateQueries({ queryKey: ["comments", taskKey] });

      } else {
        // if no active task, but comments updated, just invalidate and refetch for all.
        qc.invalidateQueries({ queryKey: ["comments"], refetchType: "all" });

      }
    });

    return () => {
      ch.unbind(EVENTS.TASKS_UPDATED);
      ch.unbind(EVENTS.LISTS_UPDATED);
      ch.unbind(EVENTS.COMMENTS_UPDATED);
      pusherClient.unsubscribe(chan);
    };
  }, [chan, projectKey, taskKey, qc]);
}
