import { Calendar } from "lucide-react";
import { TaskSelect } from "@/types";
import { formatDate } from "../../../lib/utils";

type TaskCreatedAtProps = {
  activeTask: TaskSelect;
};

export function TaskCreated({ activeTask }: TaskCreatedAtProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
        <div className="flex items-center gap-2 text-inherit">
          <Calendar size={16} />
          <p className="text-sm font-medium"> Created </p>
        </div>
      </div>
      <div className="mt-1 flex gap-1 ml-8">
        <p className="text-foreground text-xs">
          {activeTask ? formatDate(activeTask.createdAt) : "Unable to retrieve date."}
        </p>
      </div>
    </div>
  );
}
