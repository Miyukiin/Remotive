CREATE TYPE "public"."audit_action" AS ENUM('TEAM_CREATED', 'TEAM_UPDATED', 'TEAM_DELETED', 'TEAM_MEMBER_REMOVED', 'TEAM_MEMBER_ADDED', 'TEAM_LEADER_REASSIGNED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'PROJECT_TEAM_ADDED', 'PROJECT_TEAM_REMOVED', 'PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'PROJECT_MEMBER_ROLE_UPDATED', 'LIST_CREATED', 'LIST_UPDATED', 'LIST_DELETED', 'LIST_MOVED', 'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_DELETED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_MOVED', 'TASK_MEMBER_ASSIGNED', 'TASK_MEMBER_REMOVED');--> statement-breakpoint
CREATE TYPE "public"."audit_entity" AS ENUM('team', 'project', 'list', 'task', 'comment');--> statement-breakpoint
CREATE TYPE "public"."list_color" AS ENUM('BLUE', 'GRAY', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'RED', 'YELLOW');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('Project Manager', 'Project Member');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Completed', 'On-hold', 'In Progress', 'Planning', 'Review');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actor_user_id" integer NOT NULL,
	"subject_user_id" integer,
	"entity_type" "audit_entity" NOT NULL,
	"entity_id" integer NOT NULL,
	"action" "audit_action" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"team_id" integer,
	"project_id" integer,
	"list_id" integer,
	"task_id" integer,
	"comment_id" integer
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" text NOT NULL,
	"taskId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"parentCommentId" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels_to_tasks" (
	"label_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "labels_to_tasks_task_id_label_id_pk" PRIMARY KEY("task_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"projectId" integer NOT NULL,
	"description" text,
	"color" "list_color" DEFAULT 'GRAY' NOT NULL,
	"position" integer NOT NULL,
	"isDone" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_labels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "project_labels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"color" varchar NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"team_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_team_id_project_id_user_id_pk" PRIMARY KEY("team_id","project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"description" text,
	"status" "status" DEFAULT 'Planning' NOT NULL,
	"ownerId" integer NOT NULL,
	"dueDate" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"role_name" "role_name" DEFAULT 'Project Member' NOT NULL,
	CONSTRAINT "roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar NOT NULL,
	"description" text,
	"content" text,
	"creatorId" integer NOT NULL,
	"listId" integer NOT NULL,
	"priority" "priority" NOT NULL,
	"dueDate" timestamp,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"teamName" varchar NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_teamName_unique" UNIQUE("teamName")
);
--> statement-breakpoint
CREATE TABLE "teams_to_projects" (
	"team_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_to_projects_team_id_project_id_pk" PRIMARY KEY("team_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clerk_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_to_tasks" (
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_tasks_task_id_user_id_pk" PRIMARY KEY("task_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users_to_teams" (
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"isLeader" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_teams_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_self_reference_id" FOREIGN KEY ("parentCommentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels_to_tasks" ADD CONSTRAINT "labels_to_tasks_label_id_project_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."project_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels_to_tasks" ADD CONSTRAINT "labels_to_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_labels" ADD CONSTRAINT "project_labels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_listId_lists_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD CONSTRAINT "teams_to_projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD CONSTRAINT "teams_to_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_tasks" ADD CONSTRAINT "users_to_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_tasks" ADD CONSTRAINT "users_to_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_by_entity" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_subject" ON "audit_logs" USING btree ("subject_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_project" ON "audit_logs" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_task" ON "audit_logs" USING btree ("task_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_actor" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_unique_exact" ON "audit_logs" USING btree ("actor_user_id","entity_type","entity_id","action","subject_user_id","team_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_comments_task" ON "comments" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "idx_comments_task_created" ON "comments" USING btree ("taskId","created_at");--> statement-breakpoint
CREATE INDEX "idx_comments_author" ON "comments" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "idx_comments_parent" ON "comments" USING btree ("parentCommentId");--> statement-breakpoint
CREATE INDEX "idx_lists_project" ON "lists" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "idx_lists_project_pos" ON "lists" USING btree ("projectId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "uxIsDone" ON "lists" USING btree ("projectId") WHERE "lists"."isDone" = true;--> statement-breakpoint
CREATE INDEX "idx_project_labels_task" ON "project_labels" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_labels_project_color" ON "project_labels" USING btree ("project_id","color");--> statement-breakpoint
CREATE INDEX "idx_pm_project" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_pm_user" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pm_project_user" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_pm_project_role" ON "project_members" USING btree ("project_id","role");--> statement-breakpoint
CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_due" ON "projects" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "idx_projects_status_due" ON "projects" USING btree ("status","dueDate");--> statement-breakpoint
CREATE INDEX "idx_projects_creator" ON "tasks" USING btree ("creatorId");--> statement-breakpoint
CREATE INDEX "idx_tasks_list" ON "tasks" USING btree ("listId");--> statement-breakpoint
CREATE INDEX "idx_tasks_list_pos" ON "tasks" USING btree ("listId","position");--> statement-breakpoint
CREATE INDEX "idx_tasks_priority" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_tasks_due" ON "tasks" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "idx_teams_teamname_lower" ON "teams" USING btree (lower("teamName"));--> statement-breakpoint
CREATE INDEX "idx_ttp_team" ON "teams_to_projects" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_ttp_project" ON "teams_to_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_users_name_lower" ON "users" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "idx_uta_task" ON "users_to_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_uta_user" ON "users_to_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_utt_team" ON "users_to_teams" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_utt_user" ON "users_to_teams" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_utt_team_isleader" ON "users_to_teams" USING btree ("team_id","isLeader");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_utt_one_leader_per_team" ON "users_to_teams" USING btree ("team_id") WHERE "users_to_teams"."isLeader" = true;