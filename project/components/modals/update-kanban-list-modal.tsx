"use client";

import { FC, useEffect } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { listSchemaForm } from "@/lib/validations/validations";
import { useLists } from "@/hooks/use-lists";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUIStore } from "@/stores/ui-store";

type UpdateKanbanModalProps = {
  project_id: number;
};

const UpdateKanbanModal: FC<UpdateKanbanModalProps> = ({ project_id }) => {
  const { updateList, isListUpdateLoading } = useLists(project_id);
  const { activeList } = useKanbanStore();
  const { isUpdateKanbanModalOpen, setUpdateKanbanModalOpen } = useUIStore();

  const form = useForm<z.infer<typeof listSchemaForm>>({
    resolver: zodResolver(listSchemaForm),
    defaultValues: { name: activeList?.name },
    mode: "onSubmit",
  });

  // Keep form in sync when opening with a different list
  useEffect(() => {
    if (isUpdateKanbanModalOpen) form.reset({ name: activeList?.name });
  }, [isUpdateKanbanModalOpen, activeList?.name, form]);

  const onSubmit = async (values: z.infer<typeof listSchemaForm>) => {
    const maybePromise = updateList({ list_id: activeList!.id, project_id, listFormData: values });
    await maybePromise;
    setUpdateKanbanModalOpen(false);
  };

  return (
    <Dialog open={isUpdateKanbanModalOpen} onOpenChange={setUpdateKanbanModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Column</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter column name" disabled={isListUpdateLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setUpdateKanbanModalOpen(false)}
                disabled={isListUpdateLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isListUpdateLoading}>
                <LoadingButtonContent isLoading={isListUpdateLoading} displayText="Update" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateKanbanModal;
