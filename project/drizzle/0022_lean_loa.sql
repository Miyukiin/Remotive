CREATE TYPE "public"."audit_action" AS ENUM('TEAM_CREATED', 'TEAM_UPDATED', 'TEAM_DELETED', 'TEAM_MEMBER_REMOVED', 'TEAM_MEMBER_ADDED', 'TEAM_LEADER_REASSIGNED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'PROJECT_TEAM_ADDED', 'PROJECT_TEAM_REMOVED', 'PROJECT_MEMBER_ROLE_UPDATED', 'LIST_CREATED', 'LIST_UPDATED', 'LIST_DELETED', 'LIST_MOVED', 'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_DELETED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_MOVED', 'TASK_MEMBER_ASSIGNED', 'TASK_MEMBER_REMOVED');--> statement-breakpoint
CREATE TYPE "public"."audit_entity" AS ENUM('team', 'project', 'list', 'task', 'comment');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actor_user_id" integer NOT NULL,
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
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_by_entity" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_project" ON "audit_logs" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_task" ON "audit_logs" USING btree ("task_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_by_actor" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_unique_exact" ON "audit_logs" USING btree ("actor_user_id","entity_type","entity_id","action","created_at");