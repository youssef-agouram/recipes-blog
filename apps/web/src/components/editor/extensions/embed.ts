import { Node, mergeAttributes } from '@tiptap/core';

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
      { tag: 'div.embed-container' },
      { tag: 'iframe' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      { class: 'embed-container' },
      [
        'iframe',
        mergeAttributes(
          {
            src: node.attrs.src,
            frameborder: '0',
            allowfullscreen: 'true',
          },
          HTMLAttributes
        ),
      ],
    ];
  },
});

export default Embed;
