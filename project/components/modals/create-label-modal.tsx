import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUIStore } from "@/stores/ui-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { LabelCreateForm } from "@/types";
import { labelSchemaForm } from "@/lib/validations/validations";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useLabels } from "@/hooks/use-labels";
import { LoadingButtonContent } from "../ui/loading-button-content";

type CreateLabelModalProps = { project_id: number };

export function CreateLabelModal({ project_id }: CreateLabelModalProps) {
  const { isCreateLabelModalOpen, setCreateLabelModalOpen } = useUIStore();
  const { createLabel, isLabelCreationLoading } = useLabels({project_id});

  const form = useForm<LabelCreateForm>({
    resolver: zodResolver(labelSchemaForm),
    defaultValues: { name: "", color: "#000000" },
  });

  async function onSubmit(values: LabelCreateForm) {
    await createLabel({ project_id, labelFormData: values });
    form.reset({ name: "", color: "#000000" });
    setCreateLabelModalOpen(false);
  }

  return (
    <Dialog open={isCreateLabelModalOpen} onOpenChange={setCreateLabelModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create a New Label</DialogTitle>
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
                onClick={() => setCreateLabelModalOpen(false)}
                disabled={isLabelCreationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLabelCreationLoading}>
                <LoadingButtonContent isLoading={isLabelCreationLoading} displayText="Create" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
