import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUIStore } from "@/stores/ui-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { LabelUpdateForm } from "@/types";
import { labelSchemaUpdateForm } from "@/lib/validations/validations";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useLabels } from "@/hooks/use-labels";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { useLabelStore } from "@/stores/labels-store";
import { useEffect } from "react";

type UpdateLabelModalProps = { project_id: number };

export function UpdateLabelModal({ project_id }: UpdateLabelModalProps) {
  const { isUpdateLabelModalOpen, setUpdateLabelModalOpen } = useUIStore();
  const { labelToUpdate } = useLabelStore();
  const { updateLabel, isLabelUpdateLoading } = useLabels(project_id);

  const form = useForm<LabelUpdateForm>({
    resolver: zodResolver(labelSchemaUpdateForm),
    defaultValues: { name: labelToUpdate?.name, color: labelToUpdate?.color },
  });

  async function onSubmit(values: LabelUpdateForm) {
    if (!labelToUpdate) throw new Error("Unable to find label to update.");
    await updateLabel({
      project_id,
      label_id: labelToUpdate.id,
      labelFormData: { ...values, project_id: project_id },
    });
    form.reset({ name: labelToUpdate?.name, color: labelToUpdate?.color });
    setUpdateLabelModalOpen(false);
  }

  // Load labelToUpdate when populated
  useEffect(() => {
    if (!labelToUpdate) return;
    form.reset({
      name: labelToUpdate.name ?? "",
      color: labelToUpdate.color ?? "#000000",
    });
  }, [labelToUpdate, isUpdateLabelModalOpen, form]);

  return (
    <Dialog open={isUpdateLabelModalOpen} onOpenChange={setUpdateLabelModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Update a New Label</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Label name (Bug, etc.)" {...field} />
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
                  <FormLabel>Label Color (HEX)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <HexColorInput
                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm  focus:inset-ring-2 focus:inset-ring-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        color={field.value}
                        onChange={field.onChange}
                        prefixed={true}
                      />
                      <div className="flex justify-center">
                        <HexColorPicker color={field.value} onChange={field.onChange} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setUpdateLabelModalOpen(false)}
                disabled={isLabelUpdateLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLabelUpdateLoading}>
                <LoadingButtonContent isLoading={isLabelUpdateLoading} displayText="Update" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
