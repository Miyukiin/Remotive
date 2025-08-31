import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { eq, asc } from "drizzle-orm";
import { successResponse, failResponse } from "./query_utils";
import { logAction } from "@/lib/audit/audit.utils";

export const comments = {
  getByTask: async (taskId: number): Promise<types.QueryResponse<Array<types.CommentSelect>>> => {
    try {
      const comments = await db
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.taskId, taskId))
        .orderBy(asc(schema.comments.createdAt));

      return successResponse(`Task comments retrieved successfully.`, comments);
    } catch (e) {
      return failResponse(`Unable to retrieve comments.`, e);
    }
  },
  getById: async (comment_id: number): Promise<types.QueryResponse<types.CommentSelect>> => {
    try {
      const [comment] = await db.select().from(schema.comments).where(eq(schema.comments.id, comment_id)).limit(1);
      if (!comment) throw new Error("Comment not found.");

      return successResponse(`Comment retrieved successfully.`, comment);
    } catch (e) {
      return failResponse(`Unable to retrieve comment.`, e);
    }
  },
  create: async (data: types.CommentInsert): Promise<types.QueryResponse<types.CommentSelect>> => {
    try {
      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.CommentSelect>> => {
        const [insertedComment] = await tx.insert(schema.comments).values(data).returning();
        if (!insertedComment) throw new Error(`Database did not a result.`);

        await logAction(tx, {
          entity_id: insertedComment.id,
          entity_type: "comment",
          action: "COMMENT_CREATED",
          task_id: insertedComment.taskId, // contextual
        });

        return successResponse(`Created comment successfully.`, insertedComment);
      });

      if (txResult.success) return txResult;
      else return failResponse(`Unable to create comment.`, txResult.error);
    } catch (e) {
      return failResponse(`Unable to create comment.`, e);
    }
  },
  update: async (
    comment_id: number,
    incomingCommentData: types.CommentInsert,
  ): Promise<types.QueryResponse<types.CommentSelect>> => {
    try {
      const response = await comments.getById(comment_id);
      if (response.success === false) throw new Error(response.message);

      const existingCommentData = response.data;

      const changed: Partial<types.CommentInsert> = {};
      if (existingCommentData.content != incomingCommentData.content) changed.content = incomingCommentData.content;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...base } = existingCommentData;

      const finalUpdatedCommentData = {
        ...base,
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingCommentData);

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.CommentSelect>> => {
        const [result] = await tx
          .update(schema.comments)
          .set(finalUpdatedCommentData)
          .where(eq(schema.comments.id, comment_id))
          .returning();

        if (!result) throw new Error("Database returned no result.");

        await logAction(tx, {
          entity_id: result.id,
          entity_type: "comment",
          action: "COMMENT_UPDATED",
          task_id: result.taskId,
        });

        return successResponse(`Updated comment successfully.`, result);
      });
      if (txResult.success) return txResult;
      else return failResponse(`Unable to update comment.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update comment.`, e);
    }
  },
  delete: async (comment_id: number): Promise<types.QueryResponse<types.CommentSelect>> => {
    try {
      const txResult = await db.transaction<types.QueryResponse<types.CommentSelect>>(async (tx) => {
        // Re-fetch inside tx for consistency + context
        const toDelete = await tx.query.comments.findFirst({
          where: eq(schema.comments.id, comment_id),
          columns: { id: true, taskId: true },
        });
        if (!toDelete) throw new Error("Comment not found.");

        const [result] = await tx.delete(schema.comments).where(eq(schema.comments.id, comment_id)).returning();
        if (!result) throw new Error("Database returned no result.");

        await logAction(tx, {
          entity_id: result.id,
          entity_type: "comment",
          action: "COMMENT_DELETED",
          task_id: toDelete.taskId, // contextual
        });

        return successResponse(`Deleted comment successfully.`, result);
      });

      if (txResult.success) return txResult;
      return failResponse(`Unable to delete comment.`, `Task database creation transaction failed.`);
    } catch (e) {
      return failResponse(`Unable to delete comment.`, e);
    }
  },
};
