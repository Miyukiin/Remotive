"use server";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { checkAuthenticationStatus } from "./actions-utils";
import { failResponse } from "@/lib/db/queries/query_utils";
import {
  idSchema,
  labelSchemaDB,
  labelSchemaForm,
  updateTasksLabelsPayloadSchema,
} from "@/lib/validations/validations";
import z from "zod";
import { LabelSelect, LabelUpdateForm } from "@/types";
import { LabelsToTasksSelect } from "../types/index";

// Fetches
export async function getProjectLabelsAction(project_id: number): Promise<ServerActionResponse<LabelSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.labels.getByProject(project_id);
}

export async function getTaskLabelsAction(task_id: number): Promise<ServerActionResponse<LabelSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.labels.getByTask(task_id);
}

// Mutations
export async function createLabelAction(
  project_id: number,
  labelFormData: z.infer<typeof labelSchemaForm>,
): Promise<ServerActionResponse<LabelSelect>> {
  await checkAuthenticationStatus();

  const labelDBData: z.infer<typeof labelSchemaDB> = {
    ...labelFormData,
    project_id,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Zod strips unknown keys.
  const parsed = labelSchemaDB.safeParse(labelDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.labels.create(labelDBData);
}

export async function deleteLabelAction(label_id: number): Promise<ServerActionResponse<LabelSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: label_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.labels.delete(label_id);
}

export async function updateLabelAction(
  project_id: number,
  label_id: number,
  labelFormData: LabelUpdateForm,
): Promise<ServerActionResponse<LabelSelect>> {
  await checkAuthenticationStatus();

  // Check if exists
  const res = await queries.labels.getById(label_id);
  if (!res.success) return res;

  const labelDBData: z.infer<typeof labelSchemaDB> = {
    ...res.data,
    ...labelFormData,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Zod strips unknown keys.
  const parsed = labelSchemaDB.safeParse(labelDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.labels.update(label_id, labelDBData);
}

export async function updateTaskLabelsAction(
  task_id: number,
  incomingLabels: LabelSelect[],
): Promise<ServerActionResponse<LabelSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({id: task_id});
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const parsed2 = updateTasksLabelsPayloadSchema.safeParse(incomingLabels);
  if (!parsed2.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed2.error));

  return await queries.labels.updateAssignedTaskLabels(task_id, incomingLabels);
}
