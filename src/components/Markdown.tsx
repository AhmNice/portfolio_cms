import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Copy, Check } from "lucide-react";
import { isValidElement, useState } from "react";
import toast from "react-hot-toast";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer = ({
  content,
  className = "",
}: MarkdownViewerProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast.success("copied!");
      },
      (err) => {
        toast.error("Failed to copy text");
        console.error("Failed to copy: ", err);
      },
    );
  };

  // Extract text content from children
  const extractText = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map((child) => extractText(child)).join("");
    }
    if (isValidElement<{ children?: React.ReactNode }>(children)) {
      return extractText(children.props.children);
    }
    return "";
  };

  return (
    <article
      className={`
        max-w-none
        text-on-surface
        ${className}
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children, id }) => (
            <h1
              id={id}
              className="font-heading font-bold text-headline-xl text-on-surface mb-6"
            >
              {children}
            </h1>
          ),

          h2: ({ children, id }) => (
            <h2
              id={id}
              className="font-heading font-bold text-headline-lg text-on-surface mt-10 mb-4"
            >
              {children}
            </h2>
          ),

          h3: ({ children, id }) => (
            <h3
              id={id}
              className="font-heading font-bold text-headline-md text-on-surface mt-8 mb-3"
            >
              {children}
            </h3>
          ),

          // Paragraph
          p: ({ children }) => (
            <p className="font-body text-body-lg leading-8 text-on-surface/80 mb-6">
              {children}
            </p>
          ),

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-primary bg-surface-container p-5 rounded-r-lg text-on-surface/80 italic">
              {children}
            </blockquote>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2 text-on-surface/80">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 space-y-2 text-on-surface/80">
              {children}
            </ol>
          ),

          li: ({ children }) => <li className="leading-7">{children}</li>,

          // Inline code
          code: ({ children, className }) => {
            const isCodeBlock = className?.startsWith("language-");

            if (!isCodeBlock) {
              return (
                <code className="rounded-md bg-surface-container px-1.5 py-0.5 font-mono text-sm text-primary">
                  {children}
                </code>
              );
            }

            return (
              <code
                className={`
                  ${className ?? ""}
                  font-mono
                  text-sm
                  leading-7
                  text-code-text
                  bg-transparent
                `}
              >
                {children}
              </code>
            );
          },

          // Code block wrapper
          pre: ({ children }) => {
            // Extract the code content from the rendered children to avoid
            // accessing internal "node" shape which can have different types
            // (and cause TS errors about missing 'children' on Text).
            const codeContent = extractText(children);
            // Use index from props or generate one
            const index = Math.random();

            return (
              <div className="my-8 overflow-hidden rounded-xl border border-code-border bg-code-background">
                <div className="flex items-center justify-between border-b border-code-border bg-code-surface px-4 py-2">
                  <span className="font-mono text-xs text-code-muted">
                    Code
                  </span>

                  <button
                    className="flex cursor-pointer items-center gap-2 text-xs text-code-muted transition-colors hover:text-code-accent"
                    onClick={() => handleCopy(codeContent, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span className="font-mono">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="font-mono">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-code-text">
                  {children}
                </pre>
              </div>
            );
          },

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt ?? ""}
              loading="lazy"
              className="my-8 w-full rounded-xl object-cover"
            />
          ),

          // Horizontal rule
          hr: () => <hr className="my-10 border-border" />,

          // Table
          table: ({ children }) => (
            <div className="my-8 w-full overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container/40">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border-b border-outline-variant/20 bg-surface-container-high px-4 py-3 text-left font-heading text-sm font-semibold text-on-surface">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-b border-outline-variant/10 px-4 py-3 font-body text-sm text-on-surface/80">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};
