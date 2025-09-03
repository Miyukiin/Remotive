"use server";

import { CommentSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { checkAuthenticationStatus } from "./actions-utils";
import { commentSchemaDB, commentSchemaForm, idSchema } from "@/lib/validations/validations";
import { failResponse } from "@/lib/db/queries/query_utils";
import { queries } from "@/lib/db/queries/queries";
import z from "zod";
import { getUserId } from "./user-actions";
import { guardCommentAction } from "@/lib/rbac/permission-utils";
import { pusherServer } from "@/lib/pusher/pusher-server";
import { getProjectAndListFromTask } from "@/lib/rbac/permission-loaders";

// Fetches
export async function getTaskComments(task_id: number): Promise<ServerActionResponse<CommentSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardCommentAction<CommentSelect[]>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.comments.getByTask(task_id);
}

// Mutations
export async function createCommentAction(
  author_id: number,
  task_id: number,
  commentFormData: z.infer<typeof commentSchemaForm>,
): Promise<ServerActionResponse<CommentSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardCommentAction<CommentSelect>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "CREATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const parsed2 = idSchema.safeParse({ id: author_id });
  if (!parsed2.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed2.error));

  const commentDBData: z.infer<typeof commentSchemaDB> = {
    content: commentFormData.content,
    taskId: task_id,
    parentCommentId: null,
    authorId: author_id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parsed3 = commentSchemaDB.safeParse(commentDBData);
  if (!parsed3.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed3.error));

  const result = await queries.comments.create(commentDBData);
  if (!result.success) return result;

  const data = await getProjectAndListFromTask(task_id);
  if (!data) return failResponse(`Unable to retrieve project id for comment`, `PUSHERERROR`);

  // PUSHER BROADCAST
  await pusherServer.trigger(`presence-project-${data.projectId}`, "comments-updated", {});
  return result;
}

export async function updateCommentAction(
  task_id: number,
  comment_id: number,
  commentFormData: z.infer<typeof commentSchemaForm>,
): Promise<ServerActionResponse<CommentSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardCommentAction<CommentSelect>({
    actorUserId: userRes.data.id,
    commentId: comment_id,
    action: "UPDATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION

  const parsed = idSchema.safeParse({ id: comment_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const res = await queries.comments.getById(comment_id);
  if (!res.success) return res;

  const commentDBData: z.infer<typeof commentSchemaDB> = {
    ...res.data,
    ...commentFormData,
  };

  const parsed2 = commentSchemaDB.safeParse(commentDBData);
  if (!parsed2.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed2.error));

  const result = await queries.comments.update(comment_id, commentDBData);
  if (!result.success) return result;

  const data = await getProjectAndListFromTask(task_id);
  if (!data) return failResponse(`Unable to retrieve project id for comment`, `PUSHERERROR`);

  // PUSHER BROADCAST
  await pusherServer.trigger(`presence-project-${data.projectId}`, "comments-updated", {});
  return result;
}

export async function deleteCommentAction(
  task_id: number,
  comment_id: number,
): Promise<ServerActionResponse<CommentSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: comment_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const result = await queries.comments.delete(comment_id);
  if (!result.success) return result;

  const data = await getProjectAndListFromTask(task_id);
  if (!data) return failResponse(`Unable to retrieve project id for comment`, `PUSHERERROR`);

  // PUSHER BROADCAST
  await pusherServer.trigger(`presence-project-${data.projectId}`, "comments-updated", {});
  return result;
}
