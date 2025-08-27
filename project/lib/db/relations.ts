import { relations } from "drizzle-orm/relations";
import {
  lists,
  tasks,
  users,
  comments,
  projects,
  project_labels as projectLabels,
  labels_to_tasks as labelsToTasks,
  users_to_tasks as usersToTasks,
  teams,
  teams_to_projects as teamsToProjects,
  users_to_teams as usersToTeams,
  project_members as projectMembers,
  roles,
} from "./schema";

export const tasksRelations = relations(tasks, ({one, many}) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id]
  }),
  user: one(users, {
    fields: [tasks.creatorId],
    references: [users.id]
  }),
  comments: many(comments),
  usersToTasks: many(usersToTasks),
  labelsToTasks: many(labelsToTasks),
}));

export const listsRelations = relations(lists, ({one, many}) => ({
  tasks: many(tasks),
  project: one(projects, {
    fields: [lists.projectId],
    references: [projects.id]
  }),
}));

export const usersRelations = relations(users, ({many}) => ({
  tasks: many(tasks),
  comments: many(comments),
  projects: many(projects),
  usersToTasks: many(usersToTasks),
  usersToTeams: many(usersToTeams),
  projectMembers: many(projectMembers),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
  user: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  }),
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id]
  }),
  comment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comments_parentCommentId_comments_id"
  }),
  comments: many(comments, {
    relationName: "comments_parentCommentId_comments_id"
  }),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
  user: one(users, {
    fields: [projects.ownerId],
    references: [users.id]
  }),
  lists: many(lists),
  projectLabels: many(projectLabels),
  teamsToProjects: many(teamsToProjects),
  projectMembers: many(projectMembers),
}));

export const projectLabelsRelations = relations(projectLabels, ({one, many}) => ({
  project: one(projects, {
    fields: [projectLabels.project_id],
    references: [projects.id]
  }),
  labelsToTasks: many(labelsToTasks),
}));

export const usersToTasksRelations = relations(usersToTasks, ({one}) => ({
  task: one(tasks, {
    fields: [usersToTasks.task_id],
    references: [tasks.id]
  }),
  user: one(users, {
    fields: [usersToTasks.user_id],
    references: [users.id]
  }),
}));

export const teamsToProjectsRelations = relations(teamsToProjects, ({one}) => ({
  team: one(teams, {
    fields: [teamsToProjects.team_id],
    references: [teams.id]
  }),
  project: one(projects, {
    fields: [teamsToProjects.project_id],
    references: [projects.id]
  }),
}));

export const teamsRelations = relations(teams, ({many}) => ({
  teamsToProjects: many(teamsToProjects),
  usersToTeams: many(usersToTeams),
  projectMembers: many(projectMembers),
}));

export const labelsToTasksRelations = relations(labelsToTasks, ({one}) => ({
  projectLabel: one(projectLabels, {
    fields: [labelsToTasks.label_id],
    references: [projectLabels.id]
  }),
  task: one(tasks, {
    fields: [labelsToTasks.task_id],
    references: [tasks.id]
  }),
}));

export const usersToTeamsRelations = relations(usersToTeams, ({one}) => ({
  team: one(teams, {
    fields: [usersToTeams.team_id],
    references: [teams.id]
  }),
  user: one(users, {
    fields: [usersToTeams.user_id],
    references: [users.id]
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({one}) => ({
  team: one(teams, {
    fields: [projectMembers.team_id],
    references: [teams.id]
  }),
  project: one(projects, {
    fields: [projectMembers.project_id],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [projectMembers.user_id],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [projectMembers.role],
    references: [roles.id]
  }),
}));

export const rolesRelations = relations(roles, ({many}) => ({
  projectMembers: many(projectMembers),
}));