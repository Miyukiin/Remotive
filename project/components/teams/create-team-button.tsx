"use client";
import { Users } from "lucide-react";
import { FC, Fragment } from "react";
import { Button } from "../ui/button";
import { useUIStore } from "@/stores/ui-store";

const CreateTeamButton: FC = () => {
  const { setCreateTeamModalOpen } = useUIStore();
  return (
    <Fragment>
      <div className="mt-4 flex gap-x-2">
        <Button className="font-medium w-full" onClick={() => setCreateTeamModalOpen(true)}>
          <Users size={20} className="mr-2" />
          Create a New Team
        </Button>
      </div>
    </Fragment>
  );
};

export default CreateTeamButton;
