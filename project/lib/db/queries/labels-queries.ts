import * as types from "../../../types/index";
import { eq } from "drizzle-orm";
import { db } from "../db-index";
import * as schema from "../schema";
import { successResponse, failResponse } from "./query_utils";

export const labels = {
  getByProject: async (projectId: number): Promise<types.QueryResponse<types.LabelSelect[]>> => {
    try {
      const labels = await db
        .select()
        .from(schema.project_labels)
        .where(eq(schema.project_labels.project_id, projectId))
        .orderBy(schema.project_labels.name);

      if (labels.length >= 1) return successResponse(`All project labels retrieved.`, labels);
      else if (labels.length === 0) return successResponse(`No project labels yet.`, labels);
      throw new Error(`No project labels retrieved.`);
    } catch (e) {
      return failResponse(`Unable to retrieve project labels.`, e);
    }
  },
  //   getById: async (id: number): Promise<types.QueryResponse<types.LabelSelect>> => {},

  create: async (data: types.LabelInsert): Promise<types.QueryResponse<types.LabelSelect>> => {
    try {
      const newLabel = data;

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.LabelSelect>> => {
        const [insertedLabel] = await tx.insert(schema.project_labels).values(newLabel).returning();
        if (!insertedLabel) throw new Error(`Database did not a result.`);

        return successResponse(`Created label successfully.`, insertedLabel);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      return failResponse(`Unable to create label.`, `Label database creation transaction failed.`);
    } catch (e) {
      return failResponse(`Unable to create label.`, e);
    }
  },
  //   update: async (
  //     id: number,
  //     incomingLabelData: types.LabelInsert,
  //   ): Promise<types.QueryResponse<types.LabelSelect>> => {},
  delete: async (label_id: number): Promise<types.QueryResponse<types.LabelSelect>> => {
    try {
      const [result] = await db.delete(schema.project_labels).where(eq(schema.project_labels.id, label_id)).returning();

      // Check if deletion is successful.
      if (result) return successResponse(`Successfully deleted label`, result);
      else return failResponse(`Unable to delete label.`, `Database returned no result`);
    } catch (e) {
      return failResponse(`Unable to delete label.`, e);
    }
  },
};
