'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Code, Link as LinkIcon, Image as ImageIcon,
  Video
} from 'lucide-react';
import { useCallback } from 'react';

interface InstructionsEditorProps {
  initialContent?: any;
  onChange?: (json: any) => void;
}

export function InstructionsEditor({ initialContent, onChange }: InstructionsEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write the step-by-step instructions...' }),
    ],
    content: initialContent ?? { type: 'doc', content: [] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon: Icon,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: any;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded text-[#8b929d] transition-colors hover:text-[#e4e6eb] ${
        isActive ? 'bg-[#272a35] text-[#e4e6eb]' : ''
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  if (!editor) {
    return <div className="rounded-lg border border-[#272a35] bg-[#141821] p-4 text-sm text-[#8b929d]">Loading editor...</div>;
  }

  return (
    <div className="rounded-lg border border-[#272a35] bg-[#141821] overflow-hidden">
      {/* Inline Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#272a35] bg-[#1a1d26] px-2 py-1.5">
        <ToolbarButton
          icon={Bold}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        <div className="mx-1 h-4 w-px bg-[#272a35]" />

        <ToolbarButton
          icon={List}
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <div className="mx-1 h-4 w-px bg-[#272a35]" />

        <ToolbarButton
          icon={AlignLeft}
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          icon={AlignCenter}
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          icon={AlignRight}
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolbarButton
          icon={AlignJustify}
          isActive={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />

        <div className="mx-1 h-4 w-px bg-[#272a35]" />

        <ToolbarButton
          icon={Quote}
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Code}
          isActive={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />

        <div className="mx-1 h-4 w-px bg-[#272a35]" />

        <ToolbarButton
          icon={LinkIcon}
          isActive={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        />
        <ToolbarButton
          icon={ImageIcon}
          onClick={() => {
            const url = window.prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        />
        <ToolbarButton
          icon={Video}
          onClick={() => {
            const url = window.prompt('Enter video URL');
            if (url) {
              editor.chain().focus().insertContent({
                type: 'paragraph',
                content: [{ type: 'text', text: `Video: ${url}` }],
              }).run();
            }
          }}
        />
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
