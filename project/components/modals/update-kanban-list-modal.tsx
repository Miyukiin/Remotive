"use client";

import { FC, useEffect } from "react";
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
import { Textarea } from "../ui/textarea";
import { ListFormInput, ListFormOutput } from "@/types";
import { listColorTuple } from "@/lib/db/db-enums";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { listColor } from "@/lib/utils";

type UpdateKanbanModalProps = {
  project_id: number;
};

type ListColor = (typeof listColorTuple)[number];

const UpdateKanbanModal: FC<UpdateKanbanModalProps> = ({ project_id }) => {
  const { updateList, isListUpdateLoading } = useLists(project_id);
  const { activeList } = useKanbanStore();
  const { isUpdateKanbanModalOpen, setUpdateKanbanModalOpen } = useUIStore();

  const form = useForm<ListFormInput, undefined, ListFormOutput>({
    resolver: zodResolver(listSchemaForm),
    defaultValues: { name: activeList?.name, description: activeList?.description ?? "", color: activeList?.color },
    mode: "onSubmit",
  });

  // Keep form in sync when opening with a different list
  useEffect(() => {
    if (isUpdateKanbanModalOpen) {
      form.reset({
        name: activeList?.name ?? "",
        description: activeList?.description ?? "",
        color: activeList?.color ?? "GRAY",
      });
    }
  }, [isUpdateKanbanModalOpen, activeList, form]);

  const onSubmit = async (values: ListFormOutput) => {
    const maybePromise = updateList({ list_id: activeList!.id, project_id, listFormData: values });
    await maybePromise;
    setUpdateKanbanModalOpen(false);
  };

  return (
    <Dialog open={isUpdateKanbanModalOpen} onOpenChange={setUpdateKanbanModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""} // Required as textarea does not accept null.
                      onChange={(e) => field.onChange(e.target.value)} // Required as textarea does not accept null.
                      className="resize-y max-h-[200px]"
                      placeholder="Enter Description.."
                      disabled={isListUpdateLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v as ListColor)}
                      disabled={isListUpdateLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a color" />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectGroup>
                          <SelectLabel>Color</SelectLabel>
                          {listColorTuple.map((c) => (
                            <SelectItem key={c} value={c}>
                              <span className={`rounded-full w-4 h-4 ${listColor[c as ListColor]}`}> </span>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
