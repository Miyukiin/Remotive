import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QuillEditor } from "@/components/ui/rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CommentCreateForm, TaskSelect, UserSelect } from "@/types";
import { commentSchemaForm } from "@/lib/validations/validations";
import { useComments } from "@/hooks/use-comments";
import { getUserId, getUserObjectById } from "@/actions/user-actions";
import { toast } from "sonner";
import { Ellipsis, Loader2Icon, SquarePen, Trash } from "lucide-react";
import { initials } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContentRenderer } from "./content-renderer";
import { useEffect, useMemo, useState } from "react";

type TaskCommentsProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
};

export function TaskComments({ activeTask, isMobile }: TaskCommentsProps) {
  return (
    <div className="flex flex-col gap-5">
      <CommentBlocks activeTask={activeTask} isMobile={isMobile} />
      <CommentArea activeTask={activeTask} isMobile={isMobile} />
    </div>
  );
}

type CommentBlocksProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
};

function CommentBlocks({ activeTask, isMobile }: CommentBlocksProps) {
  const {
    taskComments,
    taskCommentsIsLoading,
    deleteComment,
    isCommentDeletionLoading,
    updateComment,
    isCommentUpdateLoading,
  } = useComments(activeTask.id);

  const [commentAuthors, setCommentAuthors] = useState<Record<number, UserSelect>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  // form for editing a single comment at a time
  const editForm = useForm<CommentCreateForm>({
    resolver: zodResolver(commentSchemaForm),
    defaultValues: { content: "" },
  });

  const authorIds = useMemo(() => Array.from(new Set((taskComments ?? []).map((c) => c.authorId))), [taskComments]);

  useEffect(() => {
    if (!authorIds.length) return; // If no authorIds, return
    const missing = authorIds.filter((id) => !commentAuthors[id]); // Get authors we do not yet have.
    if (!missing.length) return; // If no one is missing, return

    let alive = true; // flag to avoid setting state after unmount
    (async () => {
      try {
        // Retrieve our missing authors data objects
        const pairs = await Promise.all(
          missing.map(async (id) => {
            const res = await getUserObjectById(id);
            return res.success ? [id, res.data] : null;
          }),
        );
        if (!alive) return;
        // add our missing authors to the existing set of comment authors
        setCommentAuthors((prev) => ({
          ...prev,
          ...Object.fromEntries(pairs.filter(Boolean) as [number, UserSelect][]),
        }));
      } catch {
        toast.error("Error", { description: "Unable to retrieve some comments." });
      }
    })();

    return () => {
      alive = false;
    };
  }, [authorIds, commentAuthors]);

  // initial/empty/error states
  if (
    (taskCommentsIsLoading && !taskComments?.length) ||
    (Object.keys(commentAuthors).length === 0 && taskComments?.length)
  )
    return (
      <div className="flex justify-center items-center py-10 text-muted-foreground gap-2">
        <Loader2Icon className="animate-spin" /> <p>Loading the discussion...</p>
      </div>
    );

  if (taskComments && taskComments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No comments yet — be the first to chime in</p>
      </div>
    );
  }

  if (!taskComments)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Unable to retrieve comments.</p>
      </div>
    );

  // handlers for edit flow
  function startEdit(commentId: number, currentContent: string | null) {
    setEditingId(commentId);
    editForm.reset({ content: currentContent ?? "" });
  }

  function cancelEdit(originalContent: string | null) {
    editForm.reset({ content: originalContent ?? "" });
    setEditingId(null);
  }

  const submitEdit = (commentId: number) =>
    editForm.handleSubmit(async (values) => {
      await updateComment({
        task_id: activeTask.id,
        comment_id: commentId,
        commentFormData: values,
      });
      setEditingId(null);
    });

  return (
    <div className="flex gap-4">
      <div className="flex w-full flex-col gap-4">
        {taskComments.map((c) => {
          const commentAuthor = commentAuthors[c.authorId];
          if (!commentAuthor) return null;
          const formattedTime = format(c.createdAt, "EEEE, MMM d yyyy | h:mm a");
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className="flex w-full gap-3">
              {!isMobile && (
                <Avatar className="w-12 h-12">
                  <AvatarImage src={commentAuthor.image_url} />
                  <AvatarFallback className="text-sm">{initials(commentAuthor.name)}</AvatarFallback>
                </Avatar>
              )}

              <div className="w-full rounded-md border border-emerald-900/40 dark:border-emerald-400/20">
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-emerald-100/5 dark:bg-emerald-400/5 rounded-t-md border-emerald-900/40 dark:border-emerald-400/20">
                  <div className="flex items-center gap-2 flex-1 basis-0 min-w-0">
                    {isMobile && (
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={commentAuthor.image_url} />
                        <AvatarFallback className="text-sm">{initials(commentAuthor.name)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 basis-0 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1 min-w-0">
                        <p className="text-xs font-medium truncate min-w-0">{commentAuthor.name}</p>
                        {!isMobile && (
                          <span className="font-light text-xs text-foreground/70 shrink-0">
                            left on {formattedTime}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate min-w-0">{commentAuthor.email}</p>
                      {isMobile && (
                        <span className="font-light text-xs text-foreground/70 shrink-0">left on {formattedTime}</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={isEditing || isCommentDeletionLoading || isCommentUpdateLoading}
                          onClick={() => startEdit(c.id, c.content)}
                        >
                          <SquarePen /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isCommentDeletionLoading || isEditing}
                          variant="destructive"
                          onClick={() => {
                            deleteComment({ task_id: activeTask.id, comment_id: c.id });
                          }}
                        >
                          <Trash />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 w-full">
                  {isEditing ? (
                    <form className="space-y-3" onSubmit={submitEdit(c.id)} id={`comment-edit-form-${c.id}`}>
                      <Controller
                        name="content"
                        control={editForm.control}
                        render={({ field }) => (
                          <QuillEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Edit your comment…"
                            className="scrollbar-custom overflow-y-scroll min-h-40 max-h-[500px]"
                          />
                        )}
                      />

                      {editForm.formState.errors.content ? (
                        <p className="px-1 text-xs text-destructive">
                          {String(editForm.formState.errors.content.message)}
                        </p>
                      ) : null}

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => cancelEdit(c.content)}
                          disabled={isCommentUpdateLoading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isCommentUpdateLoading}>
                          {isCommentUpdateLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <ContentRenderer content={c.content} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CommentAreaProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
};

function CommentArea({ activeTask, isMobile }: CommentAreaProps) {
  const { createComment, isCommentCreationLoading } = useComments(activeTask.id);
  const [author, setAuthor] = useState<UserSelect | null>(null);
  const [isAuthorLoading, setIsAuthorLoading] = useState(true);

  useEffect(() => {
    async function retrieveAuthor() {
      try {
        const res = await getUserId();
        if (!res.success) throw new Error(res.message);
        setAuthor(res.data);
        setIsAuthorLoading(false);
      } catch {
        toast.error("Error", { description: "Unable to retrieve author." });
        return;
      }
    }
    retrieveAuthor();
  }, []);

  const form = useForm<CommentCreateForm>({
    resolver: zodResolver(commentSchemaForm),
    defaultValues: { content: "" },
  });

  const content = form.watch("content") ?? "";
  const plainTextLen = content.replace(/<[^>]*>/g, "").trim().length;
  const isSubmitDisabled = isCommentCreationLoading || plainTextLen === 0 || isAuthorLoading;


  async function onSubmit(values: CommentCreateForm) {
    if (!author) return;
    await createComment({
      author_id: author.id,
      task_id: activeTask.id,
      commentFormData: values,
    });
    form.reset({ content: "" });
  }

  return (
    <div className="flex w-full gap-3 mt-5">
      {!isMobile && (
        <Avatar className="w-12 h-12">
          <AvatarImage src={author?.image_url} />
          <AvatarFallback>{initials(author?.name)}</AvatarFallback>
        </Avatar>
      )}
      <div className="w-full space-y-5">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Avatar className="w-12 h-12">
              <AvatarImage src={author?.image_url} />
              <AvatarFallback>{initials(author?.name)}</AvatarFallback>
            </Avatar>
          )}
          <p className="text-sm md:text-base"> Add something to the discussion </p>
        </div>

        <div className="w-full rounded-md border border-green/400 dark:border-green-200/10">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Editor */}
            <Controller
              name="content"
              control={form.control}
              render={({ field }) => (
                <QuillEditor
                  className="scrollbar-custom overflow-y-scroll min-h-40 max-h-[500px]"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Discuss…"
                />
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
                    {isCommentCreationLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
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
