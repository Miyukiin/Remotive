import * as schema from "@/lib/db/schema";
import { listColor, projectsFilterOptions } from "@/lib/utils";
import {
  commentSchemaForm,
  labelSchemaForm,
  labelSchemaUpdateForm,
  listSchemaForm,
  projectSchemaForm,
  projectSchemaUpdateForm,
  taskSchemaEditForm,
  taskSchemaForm,
} from "@/lib/validations/validations";
import z from "zod";
import { TaskStatus } from "../components/tasks/task-modal-ui/task-status";

// Zod Form Types - Used in RHFs useForm and onSubmit values typing
export type ProjectCreateForm = z.infer<typeof projectSchemaForm>;
export type ProjectUpdateForm = z.infer<typeof projectSchemaUpdateForm>;

export type TaskCreateForm = z.infer<typeof taskSchemaForm>;
export type TaskUpdateForm = z.infer<typeof taskSchemaEditForm>;

export type ListFormInput = z.input<typeof listSchemaForm>;
export type ListFormOutput = z.output<typeof listSchemaForm>;

export type LabelCreateForm = z.infer<typeof labelSchemaForm>;
export type LabelUpdateForm = z.infer<typeof labelSchemaUpdateForm>;

export type CommentCreateForm = z.infer<typeof commentSchemaForm>;

// Query Types
export type QueryResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error: unknown };

// Type Narrowing for create query utilities.
export type ObjectInsert =
  | UserInsert
  | ProjectInsert
  | ListInsert
  | TaskInsert
  | CommentInsert
  | TeamsInsert
  | LabelInsert;
export type ObjectSelect =
  | UserSelect
  | ProjectSelect
  | ListSelect
  | TaskSelect
  | CommentSelect
  | TeamsSelect
  | LabelSelect;

// Type Safety
export type UserInsert = typeof schema.users.$inferInsert;
export type UserSelect = typeof schema.users.$inferSelect;

export type ProjectInsert = typeof schema.projects.$inferInsert;
export type ProjectSelect = typeof schema.projects.$inferSelect;

export type ListInsert = typeof schema.lists.$inferInsert;
export type ListSelect = typeof schema.lists.$inferSelect;

export type TaskInsert = typeof schema.tasks.$inferInsert;
export type TaskSelect = typeof schema.tasks.$inferSelect;

export type CommentInsert = typeof schema.comments.$inferInsert;
export type CommentSelect = typeof schema.comments.$inferSelect;

export type TeamsInsert = typeof schema.teams.$inferInsert;
export type TeamsSelect = typeof schema.teams.$inferSelect;

export type UsersToTeamsInsert = typeof schema.users_to_teams.$inferInsert;
export type UsersToTeamsSelect = typeof schema.users_to_teams.$inferSelect;

export type TeamsToProjectsInsert = typeof schema.teams_to_projects.$inferInsert;
export type TeamsToProjectsSelect = typeof schema.teams_to_projects.$inferSelect;

export type UsersToTasksInsert = typeof schema.users_to_tasks.$inferInsert;
export type UsersToTasksSelect = typeof schema.users_to_tasks.$inferSelect;

export type ProjectMembersInsert = typeof schema.project_members.$inferInsert;
export type ProjectMembersSelect = typeof schema.project_members.$inferSelect;

export type LabelSelect = typeof schema.project_labels.$inferSelect;
export type LabelInsert = typeof schema.project_labels.$inferInsert;

export type LabelsToTasksInsert = typeof schema.labels_to_tasks.$inferInsert;
export type LabelsToTasksSelect = typeof schema.labels_to_tasks.$inferSelect;

export type RecentProjects = {
  id: number;
  name: string;
  description: string | null;
  dueDate: Date | null;
  updatedAt: Date;
  status: "Completed" | "On-hold" | "In Progress" | "Planning" | "Review";
  memberCount: number;
  memberImages: string[];
};

export type ListPositionPayload = {
  id: number;
  position: number;
};

export type TaskPositionPayload = {
  id: number;
  list_id?: number;
  position: number;
};

export type TaskStatus = { status: string; color: keyof typeof listColor };

export type KanbanColor = keyof typeof listColor;

// Projects Filter Options Type
export type ProjectsFilterOptions = (typeof projectsFilterOptions)[number];

export type CalendarEvent = {
  id: number;
  project_id: number;
  title: string;
  start: Date;
  end: Date;
};

export type UpcomingDeadlineEvent = {
  id: number;
  project_id: number;
  title: string;
  type: "Project" | "Task";
  dueDate: Date;
};
