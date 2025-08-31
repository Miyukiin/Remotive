"use client";
import { useProjects } from "@/hooks/use-projects";
import { use } from "react";
import { KanbanBoard } from "@/components/kanban-board/kanban-board";
import { useLists } from "@/hooks/use-lists";
import { useTasks } from "@/hooks/use-tasks";
import SkeletonKanbanBoardPage from "@/components/kanban-board/kanban-page-skeleton";
import TaskDetailsModal from "@/components/modals/task-details-modal";
import { useTaskStore } from "@/stores/task-store";
import CreateTaskModal from "@/components/modals/create-task-modal";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project_id = Number(id);
  const { project, projectError } = useProjects(project_id);
  const { lists, loadingListError, updateListsPositions } = useLists(project_id);
  const { projectTasks, getProjectTasksError, updateTasksPositions } = useTasks({ project_id: project_id });
  const { listToAddTo } = useTaskStore();
  const { listTasks } = useTasks({ list_id: listToAddTo?.id });

  if (!project || !lists || !projectTasks) {
    return <SkeletonKanbanBoardPage />;
  }

  if (projectError || loadingListError || getProjectTasksError) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <p className="w-full h-full text-center text-sm text-foreground/50">
          Unable to load projects data. Please refresh the page
        </p>
      </div>
    );
  }

  return (
    <>
      <TaskDetailsModal project_id={project_id} />
      {listToAddTo && listTasks && (
        <CreateTaskModal list_id={listToAddTo.id} project_id={project_id} position={listTasks.length} />
      )}
      <div>
        {/* Kanban Board */}
        <KanbanBoard
          tasks={projectTasks}
          lists={lists}
          projectId={project_id}
          updateListsPositions={updateListsPositions}
          updateTasksPositions={updateTasksPositions}
        />
      </div>
    </>
  );
}
