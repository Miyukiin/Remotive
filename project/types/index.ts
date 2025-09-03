import * as schema from "@/lib/db/schema";
import { listColor, projectsFilterOptions } from "@/lib/utils";
import {
  commentSchemaForm,
  labelSchemaForm,
  labelSchemaUpdateForm,
  listSchemaForm,
  projectSchemaForm,
  projectSchemaUpdateForm,
  reassignTeamsSchema,
  taskSchemaEditForm,
  taskSchemaForm,
  updateProjectTeamsPayload,
} from "@/lib/validations/validations";
import z from "zod";
import { TaskStatus } from "../components/tasks/task-modal-ui/task-status";
import { db } from "@/lib/db/db-index";

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

export type ReassignTeamsForm = z.infer<typeof reassignTeamsSchema>;

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
  percentCompletion: number;
  memberCount: number;
  memberImages: string[];
};

export type RecentTasks = {
  id: number;
  title: string;
  description: string | null;
  project_id: number;
  dueDate: Date | null;
  statusName: string;
  statusColor: keyof typeof listColor;
  assigneeCount: number;
  assigneeImages: string[];
};

export type DashboardAnalytics = {
  stats: {
    activeProjects: number;
    teamMembers: number;
    completedTasks: number;
    pendingTasks: number;
  };
  deltas: {
    activeProjects: string;
    teamMembers: string;
    completedTasks: string;
    pendingTasks: string;
  };
};

export type ProjectProgressPayload = {
  total: number;
  done: number;
  percent: number;
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

export type UpdateProjectTeamsPayload = z.infer<typeof updateProjectTeamsPayload>;

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

// Typing Transaction https://github.com/drizzle-team/drizzle-orm/discussions/3271
export type DatabaseType = typeof db;
export type TransactionType = Parameters<Parameters<DatabaseType["transaction"]>[0]>[0];

export type ProjectRoles = (typeof schema.rolesEnum.enumValues)[number];

export type PendingProjectManager = { userId: number; role: ProjectRoles } | null;

// For recent activities
export type DashboardFeedItem = {
  id: number;
  action: string;
  createdAt: Date;

  actorName: string | null;
  actorImage: string | null;
  subjectName: string | null;
  subjectImage: string | null;

  projectName: string | null;
  teamName: string | null;
  listName: string | null;
  taskTitle: string | null;
};

export type TeamTasksCountChartPayload = {
  month: string;
  sixMonthsAgo: string;
  JsonSerializableTeamTasksData: {
    teamId: number;
    teamName: string;
    taskCount: number;
  }[];
};

export type TeamTasksChartDataType = {
  team: string;
  tasks: number;
  fill: string;
};

export type TasksPerMonthChartPayload = {
  labelRange: string;
  points: {
    month: string;
    count: number;
  }[];
};

export type TasksCompletionChartPayload = {
  total: number;
  completed: number;
  notCompleted: number;
  percentCompleted: number;
};
