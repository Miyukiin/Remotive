import { and, eq, gt, sql } from "drizzle-orm";
import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { getObjectById, getBaseFields, successResponse, failResponse } from "./query_utils";
import { logAction } from "@/lib/audit/audit.utils";

export const lists = {
  getByProject: async (projectId: number): Promise<types.QueryResponse<Array<types.ListSelect>>> => {
    try {
      const lists = await db
        .select()
        .from(schema.lists)
        .where(eq(schema.lists.projectId, projectId))
        .orderBy(schema.lists.position);

      if (lists.length >= 1) return successResponse(`All lists retrieved.`, lists);
      else if (lists.length === 0) return successResponse(`No lists yet.`, lists);
      throw new Error(`No lists retrieved.`);
    } catch (e) {
      return failResponse(`Unable to retrieve lists.`, e);
    }
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    return getObjectById<types.ListSelect>(id, "lists");
  },
  create: async (data: types.ListInsert): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.ListSelect>> => {
        const [list] = await tx.insert(schema.lists).values(data).returning();
        if (!list) throw new Error("Database returned no result.");

        await logAction(tx, { entity_id: list.id, entity_type: "list", action: "LIST_CREATED", list_id: list.id, project_id: data.projectId });
        return successResponse(`Created team successfully`, list);
      });

      if (txResult.success) return txResult;
      else return failResponse(`Unable to create list.`, txResult.error);
    } catch (e) {
      return failResponse(`Unable to create list.`, e);
    }
  },
  update: async (id: number, incomingListData: types.ListInsert): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const response = await lists.getById(id);
      if (!response.success) throw new Error(response.message);

      const existingListData = response.data;

      const changed: Partial<types.ListInsert> = {};
      if (existingListData.name != incomingListData.name) changed.name = incomingListData.name;
      if (existingListData.description != incomingListData.description)
        changed.description = incomingListData.description;
      if (existingListData.color != incomingListData.color) changed.color = incomingListData.color;
      if (existingListData.position != incomingListData.position) changed.position = incomingListData.position;

      const finalUpdatedListData = {
        ...getBaseFields(existingListData),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingListData);

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.ListSelect>> => {
        const [list] = await tx
          .update(schema.lists)
          .set(finalUpdatedListData as types.ListInsert)
          .where(eq(schema.lists.id, id))
          .returning();
        if (!list) throw new Error("Database returned no result.");

        await logAction(tx, { entity_id: list.id, entity_type: "list", action: "LIST_UPDATED", list_id: list.id, project_id: list.projectId  });
        return successResponse(`Updated list successfully.`, list);
      });

      if (txResult.success) return txResult;
      else return failResponse(`Unable to update list.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update list.`, e);
    }
  },
  delete: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const result = await db.transaction<types.QueryResponse<types.ListSelect>>(async (tx) => {
        const toDelete = await tx.query.lists.findFirst({
          where: eq(schema.lists.id, id),
        });

        if (!toDelete) return failResponse(`Unable to delete list.`, `List not found`);

        // Check if list has isDone attribute, if so, do not allow deletion
        if(toDelete.isDone) throw new Error("Unable to delete the list marked as done. Assign another list as done before trying to delete this list.")

        const { position: deletedPos, projectId } = toDelete;

        const [deleted] = await tx.delete(schema.lists).where(eq(schema.lists.id, id)).returning();

        if (!deleted) return failResponse(`Unable to delete list.`, `Database returned no result.`);

        await tx
          .update(schema.lists)
          .set({ position: sql`${schema.lists.position} - 1` })
          .where(and(eq(schema.lists.projectId, projectId), gt(schema.lists.position, deletedPos)));

        await logAction(tx, { entity_id: deleted.id, entity_type: "list", action: "LIST_DELETED", project_id: deleted.projectId  });

        return successResponse(`Deleted list successfully.`, deleted);
      });

      return result;
    } catch (e) {
      return failResponse(`Unable to delete list.`, e);
    }
  },
  updateListsPositions: async (
    listsPayload: types.ListPositionPayload[],
    project_id: number,
  ): Promise<types.QueryResponse<types.ListSelect[]>> => {
    try {
      const oldLists = await lists.getByProject(project_id);
      if (!oldLists.success) return failResponse(oldLists.message, oldLists.error);

      // Map old positions for auditing (list_id -> old_position) | this is in case i extend it to include diff history
      const oldPosById = new Map<number, number>();
      for (const l of oldLists.data) oldPosById.set(l.id, l.position);

      const txResult = await db.transaction<types.QueryResponse<types.ListSelect[]>>(async (tx) => {
        const now = new Date();
        for (const list of listsPayload) {
          const res = await tx
            .update(schema.lists)
            .set({ position: list.position, updatedAt: now })
            .where(eq(schema.lists.id, list.id))
            .returning();

          if (!res) throw new Error("Unable to update a list position.");
          const fromPosition = oldPosById.get(list.id);
          if (fromPosition !== undefined && fromPosition !== list.position) {
            await logAction(tx, {
              entity_type: "list",
              entity_id: list.id,
              action: "LIST_MOVED",
              project_id,
            });
          }
        }

        // Return the new list order after updates
        const newLists = await tx
          .select()
          .from(schema.lists)
          .where(eq(schema.lists.projectId, project_id))
          .orderBy(schema.lists.position);

        return successResponse(`Updated list positions successfully.`, newLists);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      else return failResponse(`Unable to update list positions.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update list positions.`, e);
    }
  },
  updateListsDoneStatus: async (new_done_list_id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const txResult = await db.transaction<types.QueryResponse<types.ListSelect>>(async (tx) => {
        const now = new Date();

        const [newDoneList] = await tx.select().from(schema.lists).where(eq(schema.lists.id, new_done_list_id));
        if (!newDoneList) throw new Error("Target list not found.");

        const [oldDoneList] = await tx
          .select()
          .from(schema.lists)
          .where(and(eq(schema.lists.projectId, newDoneList.projectId), eq(schema.lists.isDone, true)));

        let [res] = await tx
          .update(schema.lists)
          .set({ isDone: false, updatedAt: now })
          .where(eq(schema.lists.id, oldDoneList.id))
          .returning();
        if (!res) throw new Error("Unable to set old list isDone status to false.");
        await logAction(tx, { entity_id: res.id, entity_type: "list", action: "LIST_UPDATED", list_id: res.id, project_id: res.projectId  }); // Old List With Done Status Log

        [res] = await tx
          .update(schema.lists)
          .set({ isDone: true, updatedAt: now })
          .where(eq(schema.lists.id, new_done_list_id))
          .returning();
        if (!res) throw new Error("Unable to set new list isDone status to true.");
        await logAction(tx, { entity_id: res.id, entity_type: "list", action: "LIST_UPDATED", list_id: res.id, project_id: res.projectId  }); // New List With Done Status Log

        return successResponse(`Updated list status successfully.`, res);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      else return failResponse(`Unable to update list status.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update list status.`, e);
    }
  },
};
