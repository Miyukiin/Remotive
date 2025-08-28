// TODO: Task 5.6 - Create task detail modals and editing interfaces
"use client";
import { TaskSelect } from "@/types";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import MembersAvatars from "../ui/members-avatars";
import { FC, useMemo } from "react";
import { calculateOverdueInfo, capitalize, getContrastYIQ, taskPriorityColor } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import TaskOptions from "./task-options";
import { Calendar, MessageCircleMore } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/server-utils";
import { DragButton } from "../ui/drag-button";
import { useSortable } from "@dnd-kit/sortable";
import { useUIStore } from "@/stores/ui-store";
import { useTaskStore } from "@/stores/task-store";
import { useLabels } from "@/hooks/use-labels";

/*
TODO: Implementation Notes for Interns:

This component should display:
- Task title and description
- Priority indicator
- Assignee avatar
- Due date
- Labels/tags
- Comments count
- Drag handle for reordering

Props interface:
interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    assignee?: User
    dueDate?: Date
    labels: string[]
    commentsCount: number
  }
  isDragging?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Drag and drop support
- Click to open task modal
- Priority color coding
- Overdue indicators
- Responsive design
*/

type TaskCardProps = {
  task: TaskSelect;
  list_id: number;
  project_id: number;
};

export type TaskType = "task";

export interface TaskDragData {
  type: TaskType;
  task: TaskSelect;
}

const TaskCard: FC<TaskCardProps> = ({ task, list_id, project_id }) => {
  const { taskMembers, isTaskMembersLoading, getTaskMembersError } = useTasks({ task_id: task.id });
  const { taskLabels = [], isTaskLabelsLoading } = useLabels({ project_id, task_id: task.id });
  const { setTaskDetailsModalOpen } = useUIStore();
  const { setActiveTask } = useTaskStore();
  
  const LABEL_LIMIT = 4;
  const displayedLabels = useMemo(() => taskLabels.slice(0, LABEL_LIMIT),[LABEL_LIMIT, taskLabels]) 

  const { isOverdue, daysOverdue, isDueToday } = calculateOverdueInfo(task.dueDate);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  function onCardClick() {
    setActiveTask(task);
    setTaskDetailsModalOpen(true);
  }

  if (isDragging) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={`group p-0 gap-0 min-h-[185px]  ${isDragging ? "ring-2 ring-emerald-50" : ""} `}
      ></Card>
    );
  }
  return (
    <Card onClick={onCardClick} ref={setNodeRef} style={style} className={`p-0 gap-0 cursor-pointer  `}>
      <CardHeader className="px-1 py-2 justify-between items-center flex flex-row border-b-2 border-secondary relative">
        {/* Drag Button, Options Button */}
        <DragButton listeners={listeners} attributes={attributes} />
        <TaskOptions task_id={task.id} project_id={project_id} list_id={list_id} />
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          {/* Title, Priority, Description */}
          <div className="flex justify-between gap-2">
            <p className="font-medium text-foreground/85 text-sm overflow-hidden whitespace-nowrap text-ellipsis">
              {task.title}
            </p>
            <Badge className={`${taskPriorityColor[task.priority]} shrink-0 whitespace-nowrap w-auto`}>
              {capitalize(task.priority)}
            </Badge>
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-foreground/65">{task.description}</p>
          </div>

          {/* Comments Count and Due Date */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex justify-between gap-4">
              <div className="inline-flex gap-1">
                <MessageCircleMore size={14} className="text-foreground/65" />
                <p className="font-base text-muted-foreground text-xs  "> 14</p>
              </div>
              <div className="inline-flex gap-1">
                <Calendar size={14} className="text-foreground/65" />
                <p
                  className={`font-base text-xs ${isOverdue || isDueToday ? "text-red-500 dark:text-red-300" : "text-muted-foreground"}`}
                >
                  {isOverdue
                    ? `Overdue by ${daysOverdue} ${daysOverdue === 1 ? "day" : "days"}`
                    : isDueToday
                      ? "Due today"
                      : task.dueDate
                        ? formatDate(task.dueDate)
                        : "No due date"}
                </p>
              </div>
            </div>

            {/* Assignee Members */}
            <div className="flex items-center justify-end">
              {isTaskMembersLoading ? (
                <Skeleton height="5" width="24" />
              ) : taskMembers && !getTaskMembersError ? (
                taskMembers.length === 0 ? (
                  <p className="text-xs text-foreground/65">None Assigned</p>
                ) : (
                  <MembersAvatars members={taskMembers} max_visible={5} size={5} />
                )
              ) : (
                <p className="text-xs text-foreground/65">Unable to load members.</p>
              )}
            </div>
          </div>
          {/* Labels */}
          <div className="flex gap-1.5">
            {isTaskLabelsLoading ? (
              <p className="text-xs text-muted-foreground">Loading assigned labels…</p>
            ) : displayedLabels.length ? (
              displayedLabels.map((l) => (
                <Badge key={l.id} style={{ backgroundColor: l.color, color: getContrastYIQ(l.color).result }}>
                  {l.name}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No labels</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
