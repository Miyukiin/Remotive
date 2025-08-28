"use client";
import { Users } from "lucide-react";
import { FC, Fragment, useState } from "react";
import CreateTeamModal from "../modals/create-team-modal";
import { Button } from "../ui/button";

const CreateTeamButton: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Fragment>
      <div className="mt-4 flex gap-x-2">
        <Button className="font-medium w-full" onClick={() => setIsOpen(!isOpen)}>
          <Users size={20} className="mr-2" />
          Create a New Team
        </Button>
      </div>

      <CreateTeamModal isModalOpen={isOpen} setIsModalOpen={setIsOpen} />
    </Fragment>
  );
};

export default CreateTeamButton;
