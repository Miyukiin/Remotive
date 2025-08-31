"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["link", "code-block", "clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "align",
  "color",
  "background",
  "link",
  "code-block",
];

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
};

export function QuillEditor({ value, onChange, placeholder, readOnly, className }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-40 rounded-md border animate-pulse" />;

  return (
    <div
      className={[
        // outer box
        "rounded-md border bg-card text-foreground overflow-hidden",
        "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent",

        // kill Snow borders/shadows
        "[&_.ql-toolbar.ql-snow]:!border-0",
        "[&_.ql-container.ql-snow]:!border-0",
        "[&_.ql-toolbar.ql-snow]:!shadow-none",
        "[&_.ql-container.ql-snow]:!shadow-none",

        // toolbar base
        "[&_.ql-toolbar]:!border-0 [&_.ql-toolbar]:!bg-transparent",
        "[&_.ql-toolbar]:px-2 [&_.ql-toolbar]:py-2",

        // default icon colors
        "[&_.ql-toolbar_.ql-stroke]:!stroke-muted-foreground",
        "[&_.ql-toolbar_.ql-fill]:!fill-muted-foreground",

        // hover: when the button is hovered, change inner icon color
        "[&_.ql-toolbar_button:hover_.ql-stroke]:!stroke-foreground",
        "[&_.ql-toolbar_button:hover_.ql-fill]:!fill-foreground",

        // active/toggled button
        "[&_.ql-toolbar_button.ql-active_.ql-stroke]:!stroke-primary",
        "[&_.ql-toolbar_button.ql-active_.ql-fill]:!fill-primary",

        // pickers (dropdowns)
        "[&_.ql-toolbar_.ql-picker-label]:!text-muted-foreground",
        "[&_.ql-toolbar_.ql-picker-label:hover]:!bg-muted",

        "[&_.ql-toolbar_.ql-picker-label::before]:!text-muted-foreground",
        "[&_.ql-toolbar_.ql-picker-label:hover::before]:!text-foreground",
        "[&_.ql-toolbar_.ql-picker.ql-expanded_.ql-picker-label::before]:!text-foreground",
        "[&_.ql-picker-item.ql-selected::before]:!text-foreground",

        "[&_.ql-toolbar_.ql-picker-options]:!bg-popover",
        "[&_.ql-toolbar_.ql-picker-item]:!text-foreground",
        "[&_.ql-picker-item.ql-selected_.ql-stroke]:!stroke-foreground",
        "[&_.ql-picker-item.ql-selected_.ql-fill]:!fill-foreground",

        "[&_.ql-toolbar_.ql-picker-item:hover]:!bg-muted",
        "[&_.ql-toolbar_.ql-picker-item::before]:!text-foreground",

        // editor container/area
        "[&_.ql-container]:!border-0 [&_.ql-container]:!outline-0",
        "[&_.ql-editor]:min-h-[12rem] [&_.ql-editor]:p-3 [&_.ql-editor]:leading-relaxed",
        "[&_.ql-editor.ql-blank:before]:!text-muted-foreground/70",

        // code block + headings
        "[&_.ql-editor_pre]:rounded-md [&_.ql-editor_pre]:p-3 [&_.ql-editor_pre]:!bg-muted",
        "[&_.ql-editor_h1]:text-xl [&_.ql-editor_h1]:font-semibold",
        "[&_.ql-editor_h2]:text-lg [&_.ql-editor_h2]:font-semibold",

        // dark mode icon fallback
        "dark:[&_.ql-stroke]:!stroke-foreground dark:[&_.ql-fill]:!fill-foreground",
        "dark:[&_.ql-editor]:!bg-background",
        className ?? "",
      ].join(" ")}
    >
      <ReactQuill
        theme={readOnly ? "bubble" : "snow"}
        modules={readOnly ? undefined : modules}
        formats={formats}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
