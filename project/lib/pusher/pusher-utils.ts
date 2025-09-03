export const channelName = (projectId: number) => `presence-project-${projectId}`; // RETURNS CHANNEL NAME


// WHAT EVENTS DO WE HAVE 
export const EVENTS = {
  TASKS_UPDATED: "tasks-updated",
  LISTS_UPDATED: "lists-updated",
  COMMENTS_UPDATED: "comments-updated",
} as const;
