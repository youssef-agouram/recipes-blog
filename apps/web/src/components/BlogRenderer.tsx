import React from "react";

type Props = {
  content: any; // Tiptap JSON
  className?: string;
};

export default function BlogRenderer({ content, className = "prose dark:prose-invert max-w-none" }: Props) {
  if (!content) {
    return <div className={`prose text-muted-foreground ${className}`}>No content available.</div>;
  }

  // Tiptap JSON can be a string if stored as serialized JSON in database
  let parsedContent = content;
  if (typeof content === "string") {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse content string in BlogRenderer:", e);
      return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
    }
  }

  if (!parsedContent || parsedContent.type !== "doc" || !Array.isArray(parsedContent.content) || parsedContent.content.length === 0) {
    return <div className={`prose text-muted-foreground ${className}`}>No content available.</div>;
  }

  return (
    <div className={`${className} overflow-x-hidden max-w-full [&_*]:max-w-full [&_img]:max-w-full [&_table]:w-full [&_table]:table-fixed [&_pre]:overflow-x-auto [&_iframe]:max-w-full`}>
      {parsedContent.content.map((node: any, idx: number) => renderNode(node, idx))}
    </div>
  );
}

function renderNode(node: any, index: number): React.ReactNode {
  if (!node) return null;

  const key = `${node.type}-${index}`;

  switch (node.type) {
    case "paragraph": {
      const textAlign = node.attrs?.textAlign;
      return (
        <p key={key} style={textAlign ? { textAlign } : undefined}>
          {renderContent(node.content)}
        </p>
      );
    }
    case "heading": {
      const level = node.attrs?.level || 1;
      const textAlign = node.attrs?.textAlign;
      const Tag = `h${level}` as any;
      return (
        <Tag key={key} style={textAlign ? { textAlign } : undefined}>
          {renderContent(node.content)}
        </Tag>
      );
    }
    case "bulletList":
      return <ul key={key}>{renderContent(node.content)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderContent(node.content)}</ol>;
    case "listItem":
      return <li key={key}>{renderContent(node.content)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderContent(node.content)}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{renderContent(node.content)}</code>
        </pre>
      );
    case "image": {
      const { src, alt, title } = node.attrs || {};
      if (!src) return null;
      return (
        <img
          key={key}
          src={src}
          alt={alt || ""}
          title={title}
          className="block !ml-0 mr-auto my-6 max-w-full rounded-md object-cover"
        />
      );
    }
    case "embed": {
      const src = node.attrs?.src;
      if (!src) return null;
      return (
        <div key={key} style={{ position: "relative", width: "100%", paddingBottom: "56.25%", margin: "1rem 0" }}>
          <iframe
            src={src}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "8px",
            }}
            title="Embedded video"
          />
        </div>
      );
    }
    default:
      if (node.content) {
        return <div key={key}>{renderContent(node.content)}</div>;
      }
      return null;
  }
}

function renderContent(content?: any[]): React.ReactNode[] | null {
  if (!content || !Array.isArray(content)) return null;
  return content.map((child, idx) => renderChild(child, idx));
}

function renderChild(child: any, index: number): React.ReactNode {
  if (!child) return null;

  const key = `${child.type}-${index}`;

  if (child.type === "text") {
    let text: React.ReactNode = child.text;

    if (child.marks && Array.isArray(child.marks)) {
      // Apply marks in order
      child.marks.forEach((mark: any) => {
        switch (mark.type) {
          case "bold":
            text = <strong key={key}>{text}</strong>;
            break;
          case "italic":
            text = <em key={key}>{text}</em>;
            break;
          case "underline":
            text = <u key={key}>{text}</u>;
            break;
          case "strike":
            text = <s key={key}>{text}</s>;
            break;
          case "code":
            text = <code key={key}>{text}</code>;
            break;
          case "highlight":
            text = (
              <mark key={key} style={mark.attrs?.color ? { backgroundColor: mark.attrs.color } : undefined}>
                {text}
              </mark>
            );
            break;
          case "link": {
            const { href, target, rel } = mark.attrs || {};
            text = (
              <a
                key={key}
                href={href}
                target={target}
                rel={rel}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {text}
              </a>
            );
            break;
          }
        }
      });
    }

    return <React.Fragment key={key}>{text}</React.Fragment>;
  }

  return renderNode(child, index);
}
