"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSingletonHighlighter, type Highlighter } from "shiki";

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    const initializeHighlighter = async () => {
      const instance = await getSingletonHighlighter({
        themes: ["github-dark"],
        langs: [
          "sql",
          "javascript",
          "typescript",
          "python",
          "html",
          "css",
          "bash",
          "json",
          "text",
          "angular-html",
          "angular-ts",
          "c",
          "c++",
          "go",
          "java",
          "kotlin",
          "lua",
          "perl",
          "php",
          "python",
          "r",
          "ruby",
          "rust",
          "scala",
          "swift",
        ],
      });
      setHighlighter(instance);
    };

    initializeHighlighter();
  }, []);

  const CodeBlock: React.FC<CodeBlockProps> = ({
    inline,
    className,
    children,
    ...props
  }) => {
    if (inline || !highlighter || typeof children !== "string") {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const language = className?.replace(/language-/, "") || "text";
    const html = highlighter.codeToHtml(children, {
      lang: language,
      theme: "github-dark",
    });

    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        {...props}
        className="rounded-md overflow-hidden px-2 py-4 bg-gray text-sm font-mono bg-[#24292e]"
      />
    );
  };

  return (
    <ReactMarkdown
      components={{
        code: CodeBlock,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
