import { Settings, Calendar as CalendarIcon, CircleAlert } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { TaskSelect } from "@/types";
import { useState } from "react";
import { calculateOverdueInfo } from "@/lib/utils";
import { formatDate } from "@/lib/server-utils";
import { useTasks } from "@/hooks/use-tasks";

type TaskDueProps = {
  activeTask: TaskSelect;
  project_id: number;
};

export function TaskDue({ activeTask, project_id }: TaskDueProps) {
  const [open, setOpen] = useState(false);
  const { updateTaskNew, isUpdateTaskNewLoading } = useTasks({ task_id: activeTask.id });
  const { isOverdue, daysOverdue, isDueToday } = calculateOverdueInfo(activeTask.dueDate);

  const selected = activeTask.dueDate ? new Date(activeTask.dueDate) : undefined;

  async function handleSelect(date?: Date) {
    await updateTaskNew({
      task_id: activeTask.id,
      project_id: project_id,
      taskFormData: { dueDate: date ? date : null },
    });

    setOpen(false);
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm cursor-pointer"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 text-inherit">
              <CalendarIcon size={16} />
              <p className="text-sm font-medium">Due Date</p>
            </div>
            <Settings size={16} />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            autoFocus
            disabled={{ before: new Date() }} // Disable dates before today.
          />
          <div className="flex gap-2 justify-between p-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSelect(undefined)}
              disabled={!selected || isUpdateTaskNewLoading}
            >
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="mt-1 flex gap-2 ml-8">
        <p className="text-foreground text-xs">{activeTask.dueDate ? formatDate(activeTask.dueDate) : "Not Set"}</p>
        {isOverdue || isDueToday ? (
          <div className="flex gap-1  text-red-500  dark:text-red-300  items-center">
            <CircleAlert size={12} />
            <p className={`text-xs`}>
              {isDueToday ? "Due today" : `Overdue by ${daysOverdue} ${daysOverdue === 1 ? "day" : "days"}`}
            </p>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
