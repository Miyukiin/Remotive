"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectProgressPayload } from "@/types";
import { getProjectProgress } from "@/lib/api-calls/api-calls-client";

export function useProjectProgress(projectId: number) {
  return useQuery({
    queryKey: ["project-progress", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<ProjectProgressPayload> => {
      const res = await getProjectProgress(projectId);
      if (!res.success) throw new Error(res.message || "Failed to fetch project progress");
      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
