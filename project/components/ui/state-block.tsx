"use client";

import { FC, ReactNode } from "react";

type StateBlockProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

const StateBlock: FC<StateBlockProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-60 border border-dashed border-muted-foreground/20 rounded-xl p-8">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="text-sm mt-1">{description}</p> : null}
      {actions ? <div className="mt-4">{actions}</div> : null}
    </div>
  );
};

export default StateBlock;
