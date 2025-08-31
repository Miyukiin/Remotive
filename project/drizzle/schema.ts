import { pgTable, index, foreignKey, integer, varchar, text, timestamp, unique, uniqueIndex, boolean, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const listColor = pgEnum("list_color", ['BLUE', 'GRAY', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'RED', 'YELLOW'])
export const priority = pgEnum("priority", ['low', 'medium', 'high'])
export const roleName = pgEnum("role_name", ['No Role Yet', 'Project Manager', 'Developer', 'QA Engineer', 'Designer'])
export const status = pgEnum("status", ['Completed', 'On-hold', 'In Progress', 'Planning', 'Review'])


export const tasks = pgTable("tasks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "tasks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar().notNull(),
	description: text(),
	listId: integer().notNull(),
	priority: priority().notNull(),
	dueDate: timestamp({ mode: 'string' }),
	position: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	content: text(),
	creatorId: integer().notNull(),
}, (table) => [
	index("idx_projects_creator").using("btree", table.creatorId.asc().nullsLast().op("int4_ops")),
	index("idx_tasks_due").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_tasks_list").using("btree", table.listId.asc().nullsLast().op("int4_ops")),
	index("idx_tasks_list_pos").using("btree", table.listId.asc().nullsLast().op("int4_ops"), table.position.asc().nullsLast().op("int4_ops")),
	index("idx_tasks_priority").using("btree", table.priority.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.listId],
			foreignColumns: [lists.id],
			name: "tasks_listId_lists_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "tasks_creatorId_users_id_fk"
		}).onDelete("restrict"),
]);

export const comments = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	content: text(),
	taskId: integer().notNull(),
	authorId: integer().notNull(),
	parentCommentId: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_comments_author").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("idx_comments_parent").using("btree", table.parentCommentId.asc().nullsLast().op("int4_ops")),
	index("idx_comments_task").using("btree", table.taskId.asc().nullsLast().op("int4_ops")),
	index("idx_comments_task_created").using("btree", table.taskId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "comments_authorId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "comments_taskId_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "comments_self_reference_id"
		}).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "projects_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar().notNull(),
	description: text(),
	status: status().default('Planning').notNull(),
	ownerId: integer().notNull(),
	dueDate: timestamp({ mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_projects_due").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_projects_owner").using("btree", table.ownerId.asc().nullsLast().op("int4_ops")),
	index("idx_projects_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_projects_status_due").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.dueDate.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "projects_ownerId_users_id_fk"
		}).onDelete("restrict"),
	unique("projects_name_unique").on(table.name),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	clerkId: varchar("clerk_id").notNull(),
	email: varchar().notNull(),
	name: varchar().notNull(),
	imageUrl: varchar("image_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_users_name_lower").using("btree", sql`lower((name)::text)`),
	unique("users_clerk_id_unique").on(table.clerkId),
	unique("users_email_unique").on(table.email),
]);

export const roles = pgTable("roles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	roleName: roleName("role_name").default('No Role Yet').notNull(),
}, (table) => [
	unique("roles_role_name_unique").on(table.roleName),
]);

export const lists = pgTable("lists", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "lists_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar().notNull(),
	projectId: integer().notNull(),
	position: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isDone: boolean().default(false).notNull(),
	description: text(),
	color: listColor().default('GRAY').notNull(),
}, (table) => [
	index("idx_lists_project").using("btree", table.projectId.asc().nullsLast().op("int4_ops")),
	index("idx_lists_project_pos").using("btree", table.projectId.asc().nullsLast().op("int4_ops"), table.position.asc().nullsLast().op("int4_ops")),
	uniqueIndex("uxIsDone").using("btree", table.projectId.asc().nullsLast().op("int4_ops")).where(sql`("isDone" = true)`),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "lists_projectId_projects_id_fk"
		}).onDelete("cascade"),
]);

export const projectLabels = pgTable("project_labels", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "project_labels_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	projectId: integer("project_id").notNull(),
	name: varchar().notNull(),
	color: varchar().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_project_labels_project_color").using("btree", table.projectId.asc().nullsLast().op("int4_ops"), table.color.asc().nullsLast().op("int4_ops")),
	index("idx_project_labels_task").using("btree", table.projectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_labels_project_id_projects_id_fk"
		}).onDelete("cascade"),
]);

export const teams = pgTable("teams", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "teams_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	teamName: varchar().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_teams_teamname_lower").using("btree", sql`lower(("teamName")::text)`),
	unique("teams_teamName_unique").on(table.teamName),
]);

export const usersToTasks = pgTable("users_to_tasks", {
	taskId: integer("task_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_uta_task").using("btree", table.taskId.asc().nullsLast().op("int4_ops")),
	index("idx_uta_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "users_to_tasks_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "users_to_tasks_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.taskId, table.userId], name: "users_to_tasks_task_id_user_id_pk"}),
]);

export const teamsToProjects = pgTable("teams_to_projects", {
	teamId: integer("team_id").notNull(),
	projectId: integer("project_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ttp_project").using("btree", table.projectId.asc().nullsLast().op("int4_ops")),
	index("idx_ttp_team").using("btree", table.teamId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "teams_to_projects_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "teams_to_projects_project_id_projects_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.teamId, table.projectId], name: "teams_to_projects_team_id_project_id_pk"}),
]);

export const labelsToTasks = pgTable("labels_to_tasks", {
	labelId: integer("label_id").notNull(),
	taskId: integer("task_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.labelId],
			foreignColumns: [projectLabels.id],
			name: "labels_to_tasks_label_id_project_labels_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "labels_to_tasks_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.labelId, table.taskId], name: "labels_to_tasks_task_id_label_id_pk"}),
]);

export const usersToTeams = pgTable("users_to_teams", {
	teamId: integer("team_id").notNull(),
	userId: integer("user_id").notNull(),
	isLeader: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_utt_team").using("btree", table.teamId.asc().nullsLast().op("int4_ops")),
	index("idx_utt_team_isleader").using("btree", table.teamId.asc().nullsLast().op("int4_ops"), table.isLeader.asc().nullsLast().op("int4_ops")),
	index("idx_utt_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("ux_utt_one_leader_per_team").using("btree", table.teamId.asc().nullsLast().op("int4_ops")).where(sql`("isLeader" = true)`),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "users_to_teams_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "users_to_teams_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.teamId, table.userId], name: "users_to_teams_team_id_user_id_pk"}),
]);

export const projectMembers = pgTable("project_members", {
	teamId: integer("team_id").notNull(),
	projectId: integer("project_id").notNull(),
	userId: integer("user_id").notNull(),
	role: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_pm_project").using("btree", table.projectId.asc().nullsLast().op("int4_ops")),
	index("idx_pm_project_role").using("btree", table.projectId.asc().nullsLast().op("int4_ops"), table.role.asc().nullsLast().op("int4_ops")),
	index("idx_pm_project_user").using("btree", table.projectId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	index("idx_pm_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "project_members_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_members_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "project_members_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.role],
			foreignColumns: [roles.id],
			name: "project_members_role_roles_id_fk"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.teamId, table.projectId, table.userId], name: "project_members_team_id_project_id_user_id_pk"}),
]);
