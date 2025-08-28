import * as types from "../../../types/index";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db-index";
import * as schema from "../schema";
import { successResponse, failResponse, getBaseFields } from "./query_utils";

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
  getById: async (id: number): Promise<types.QueryResponse<types.LabelSelect>> => {
    try {
      const [label] = await db.select().from(schema.project_labels).limit(1).where(eq(schema.project_labels.id, id));

      if (label) return successResponse(`Retrieved label successfully.`, label);
      throw new Error(`Label does not exist.`);
    } catch (e) {
      return failResponse(`Unable to retrieve label.`, e);
    }
  },
  getByTask: async (task_id: number): Promise<types.QueryResponse<types.LabelSelect[]>> => {
    try {
      const result = await db
        .select({ labels: schema.project_labels })
        .from(schema.project_labels)
        .innerJoin(schema.labels_to_tasks, eq(schema.labels_to_tasks.label_id, schema.project_labels.id))
        .where(eq(schema.labels_to_tasks.task_id, task_id))
        .orderBy(schema.project_labels.name);

      // Unwrap
      const labels = result.map((r) => r.labels);

      if (labels.length >= 1) return successResponse(`All task labels retrieved.`, labels);
      else if (labels.length === 0) return successResponse(`No task labels yet.`, labels);
      throw new Error(`No task labels retrieved.`);
    } catch (e) {
      return failResponse(`Unable to retrieve task labels.`, e);
    }
  },

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
  update: async (id: number, incomingLabelData: types.LabelInsert): Promise<types.QueryResponse<types.LabelSelect>> => {
    try {
      const res = await labels.getById(id);
      if (!res.success) throw new Error(res.message);

      const existingLabelData = res.data;

      const changed: Partial<types.LabelInsert> = {};

      if (existingLabelData.name !== incomingLabelData.name) changed.name = incomingLabelData.name;
      if (existingLabelData.color !== incomingLabelData.color) changed.color = incomingLabelData.color;
      if (existingLabelData.project_id !== incomingLabelData.project_id)
        changed.project_id = incomingLabelData.project_id;

      const finalUpdatedLabelData = {
        ...getBaseFields(existingLabelData),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingLabelData);

      const [result] = await db
        .update(schema.project_labels)
        .set(finalUpdatedLabelData)
        .where(eq(schema.project_labels.id, id))
        .returning();

      if (result) return successResponse(`Updated label successfully.`, existingLabelData);
      else return failResponse(`Unable to update label.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update label.`, e);
    }
  },
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
  updateAssignedTaskLabels: async (
    task_id: number,
    incomingLabels: types.LabelSelect[],
  ): Promise<types.QueryResponse<types.LabelSelect[]>> => {
    try {
      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.LabelSelect[]>> => {
        // Identify which task labels were added or removed.
        // Remove or add these LabelsToTasks entries

        const existingTaskToLabelsEntries = await tx
          .select()
          .from(schema.labels_to_tasks)
          .where(eq(schema.labels_to_tasks.task_id, task_id));

        const idsofExistingTaskLabels = new Set(existingTaskToLabelsEntries.map((l) => l.label_id));
        const idsOfIncomingTaskLabels = new Set(incomingLabels.map((l) => l.id));

        const idsToAdd = [...idsOfIncomingTaskLabels].filter((id) => !idsofExistingTaskLabels.has(id));
        const idsToRemove = [...idsofExistingTaskLabels].filter((id) => !idsOfIncomingTaskLabels.has(id));

        const now = new Date();

        if (idsToAdd.length > 0) {
          const rowsToInsert: types.LabelsToTasksInsert[] = idsToAdd.map((label_id) => ({
            task_id,
            label_id,
            createdAt: now,
            updatedAt: now,
          }));

          const inserted = await tx.insert(schema.labels_to_tasks).values(rowsToInsert).returning();
          if (inserted.length !== rowsToInsert.length) {
            throw new Error("Unable to assign all labels to task.");
          }
        }

        if (idsToRemove.length > 0) {
          const deleted = await tx
            .delete(schema.labels_to_tasks)
            .where(
              and(eq(schema.labels_to_tasks.task_id, task_id), inArray(schema.labels_to_tasks.label_id, idsToRemove)),
            )
            .returning();

          if (deleted.length !== idsToRemove.length) {
            throw new Error("Unable to unassign all labels from task.");
          }
        }

        // Check existing
        const rows = await tx
          .select({ labels: schema.project_labels })
          .from(schema.project_labels)
          .innerJoin(schema.labels_to_tasks, eq(schema.labels_to_tasks.label_id, schema.project_labels.id))
          .where(eq(schema.labels_to_tasks.task_id, task_id))
          .orderBy(schema.project_labels.name);

        const newTaskLabels = rows.map((r) => r.labels);

        if (newTaskLabels.length !== incomingLabels.length)
          throw new Error("Unable to assign/unassign all task labels.");

        return successResponse(`Successfully updated task labels.`, newTaskLabels);
      });

      if (txResult.success) return successResponse(`Successfully updated task labels.`, txResult.data);
      return failResponse(`Unable update task labels.`, `Adding user to team database transaction failed`);
    } catch (e) {
      return failResponse(`Unable update task labels.`, e);
    }
  },
};
