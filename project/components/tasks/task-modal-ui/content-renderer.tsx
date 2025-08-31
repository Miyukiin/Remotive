export function ContentRenderer({ content }: { content: string }) {
  return (
    <article
      className={[
        "prose prose-sm dark:prose-invert max-w-none",

        // Align
        "[&_.ql-align-center]:text-center",
        "[&_.ql-align-right]:text-right",
        "[&_.ql-align-justify]:text-justify",

        // Indent
        "[&_.ql-indent-1]:ml-4",
        "[&_.ql-indent-2]:ml-8",
        "[&_.ql-indent-3]:ml-12",

        // Font sizes
        "[&_.ql-size-small]:text-sm",
        "[&_.ql-size-large]:text-lg",
        "[&_.ql-size-huge]:text-2xl",

        // --- Code blocks (token-based, dark-mode responsive) ---
        // Quill per-line code blocks
        "[&_.ql-code-block]:!bg-[var(--code-bg)]",
        "[&_.ql-code-block]:!text-[var(--code-text)]",
        "[&_.ql-code-block]:!border !border-[var(--code-border)]",
        "[&_.ql-code-block]:p-3 [&_.ql-code-block]:rounded-md [&_.ql-code-block]:overflow-auto",
        "[&_.ql-code-block]:font-mono [&_.ql-code-block]:text-[0.825rem] md:[&_.ql-code-block]:text-sm",

        // Syntax-highlighted <pre class='ql-syntax'>
        "[&_pre.ql-syntax]:bg-muted",
        "[&_pre.ql-syntax]:text-foreground",
        "[&_pre.ql-syntax]:p-3",
        "[&_pre.ql-syntax]:rounded-md",
        "[&_pre.ql-syntax]:border",
        "[&_pre.ql-syntax]:border-border",
        "[&_pre.ql-syntax]:overflow-auto",
        "[&_pre.ql-syntax]:font-mono",
        "[&_pre.ql-syntax]:text-[0.825rem] md:[&_pre.ql-syntax]:text-sm",

        // Lists
        "[&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:pl-5",

        // Links / images
        "prose-a:text-primary hover:prose-a:underline",
        "prose-img:rounded-md",
      ].join(" ")}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
