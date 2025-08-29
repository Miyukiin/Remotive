import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QuillEditor } from "@/components/ui/rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CommentCreateForm, TaskSelect } from "@/types";
import { commentSchemaForm } from "@/lib/validations/validations";
import { useComments } from "@/hooks/use-comments";
import { getUserId } from "@/actions/user-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type TaskCommentsProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
};

export function TaskComments({ activeTask, isMobile }: TaskCommentsProps) {
  return (
    <div>
      <CommentBlocks activeTask={activeTask} />
      <CommentArea activeTask={activeTask} isMobile={isMobile} />;
    </div>
  );
}

type CommentBlocksProps = {
  activeTask: TaskSelect;
};

function CommentBlocks({ activeTask }: CommentBlocksProps) {
  const { taskComments, taskCommentsIsLoading } = useComments(activeTask.id);
  return <></>;
}

type CommentAreaProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
};

function CommentArea({ activeTask, isMobile }: CommentAreaProps) {
  const { createComment, isCommentCreationLoading, taskComments, taskCommentsIsLoading } = useComments(activeTask.id);

  const form = useForm<CommentCreateForm>({
    resolver: zodResolver(commentSchemaForm),
    defaultValues: { content: "" },
  });

  const content = form.watch("content") ?? "";
  const plainTextLen = content.replace(/<[^>]*>/g, "").trim().length;
  const isSubmitDisabled = isCommentCreationLoading || plainTextLen === 0;

  async function onSubmit(values: CommentCreateForm) {
    // Retrieve author
    let author;
    try {
      const res = await getUserId();
      if (!res.success) throw new Error(res.message);
      author = res.data;
    } catch {
      toast.error("Error", { description: "Unable to retrieve author." });
      return;
    }

    await createComment({
      author_id: author.id,
      task_id: activeTask.id,
      commentFormData: values,
    });
    form.reset({ content: "" });
  }

  return (
    <div className="flex w-full gap-3 mt-10">
      {!isMobile && (
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
      <div className="w-full space-y-5">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          )}
          <p> Add a comment </p>
        </div>

        <div className="w-full rounded-md border border-green/400 dark:border-green-200/10">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Editor */}
            <Controller
              name="content"
              control={form.control}
              render={({ field }) => (
                <QuillEditor value={field.value} onChange={field.onChange} placeholder="Write your comment…" />
              )}
            />

            {/* Validation error */}
            {form.formState.errors.content ? (
              <p className="px-3 py-2 text-xs text-destructive">{String(form.formState.errors.content.message)}</p>
            ) : null}

            {/* Actions */}
            <div className="p-3 w-full space-y-2 flex flex-col items-end">
              <div className="flex w-full items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {plainTextLen} character{plainTextLen === 1 ? "" : "s"}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.reset({ content: "" })}
                    disabled={isSubmitDisabled}
                  >
                    Clear
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitDisabled}>
                    {isCommentCreationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
