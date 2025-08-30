import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { eq, asc } from "drizzle-orm";
import { successResponse, failResponse, getBaseFields } from "./query_utils";

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
      const newComment = data;

      const [insertedComment] = await db.insert(schema.comments).values(newComment).returning();
      if (!insertedComment) throw new Error(`Database did not a result.`);

      return successResponse(`Created comment successfully.`, insertedComment);
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

      const { id, ...base } = existingCommentData;

      const finalUpdatedCommentData = {
        ...base,
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingCommentData);

      const [result] = await db
        .update(schema.comments)
        .set(finalUpdatedCommentData)
        .where(eq(schema.comments.id, comment_id))
        .returning();

      if (!result) throw new Error("Database returned no result.");
      return successResponse(`Updated comment successfully.`, result);
    } catch (e) {
      return failResponse(`Unable to update comment.`, e);
    }
  },
  delete: async (comment_id: number): Promise<types.QueryResponse<types.CommentSelect>> => {
    try {
      const response = await comments.getById(comment_id);
      if (!response.success) throw new Error(response.message);

      const [result] = await db.delete(schema.comments).where(eq(schema.comments.id, comment_id)).returning();

      if (!result) throw new Error("Database returned no result.");
      return successResponse(`Deleted comment successfully.`, result);
    } catch (e) {
      return failResponse(`Unable to delete comment.`, e);
    }
  },
};
