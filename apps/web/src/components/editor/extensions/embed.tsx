import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import React from 'react';

function EmbedComponent({ node }: NodeViewProps) {
  const src = node.attrs.src as string | null;
  if (!src) return null;

  return (
    <NodeViewWrapper style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', margin: '1rem 0' }}>
      <iframe
        src={src}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
        title="Embedded video"
      />
    </NodeViewWrapper>
  );
}

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

const Embed = Node.create<EmbedOptions>({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-embed-src]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ class: 'embed-container', 'data-embed-src': node.attrs.src }),
      [
        'iframe',
        mergeAttributes(
          {
            src: node.attrs.src,
            frameborder: '0',
            allowfullscreen: 'true',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          },
          HTMLAttributes
        ),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent);
  },
});

export default Embed;