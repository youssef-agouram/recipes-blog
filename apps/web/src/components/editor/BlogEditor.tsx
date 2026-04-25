import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';

import CharacterCount from '@tiptap/extension-character-count';

import { Toolbar } from './Toolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { LinkEditorModal } from './LinkEditorModal';
import { ImageUpload } from './ImageUpload';
import { SlashCommand, renderItems } from './SlashCommand';

interface BlogEditorProps {
  initialContent?: JSONContent | string;
  onChange?: (content: JSONContent) => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ initialContent, onChange }) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full mx-auto shadow-sm',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      Highlight.configure({ multicolor: true }),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            // Import getSuggestionItems dynamically or handle it locally if imported above
            // We use the imported function from SlashCommand.tsx
            const { getSuggestionItems } = require('./SlashCommand');
            return getSuggestionItems({ query });
          },
          render: renderItems,
        },
      }),
      CharacterCount,
    ],
    content: initialContent || '',
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json);
    },
  });

  // Custom event listener to open image modal from slash command
  useEffect(() => {
    const handleOpenImageModal = () => setIsImageModalOpen(true);
    document.addEventListener('open-image-modal', handleOpenImageModal);
    return () => {
      document.removeEventListener('open-image-modal', handleOpenImageModal);
    };
  }, []);

  const handleLinkSave = useCallback((url: string, openInNewTab: boolean) => {
    if (!editor) return;
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: openInNewTab ? '_blank' : '' })
      .run();
  }, [editor]);

  const handleLinkRemove = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setIsLinkModalOpen(false);
  }, [editor]);

  const handleImageInsert = useCallback((url: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const getCurrentLinkUrl = () => {
    if (!editor) return '';
    return editor.getAttributes('link').href || '';
  };

  const isCurrentLinkTargetBlank = () => {
    if (!editor) return true;
    return editor.getAttributes('link').target === '_blank';
  };

  if (!editor) {
    return null;
  }

  // Calculate stats
  const words = editor.storage.characterCount?.words() || 0;
  const characters = editor.storage.characterCount?.characters() || 0;

  return (
    <div className="flex flex-col border rounded-lg shadow-sm bg-background">
      <Toolbar 
        editor={editor} 
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
      />
      
      <EditorBubbleMenu 
        editor={editor}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
      />

      <div className="relative flex-grow">
        <EditorContent editor={editor} />
      </div>

      <div className="flex justify-between items-center px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground rounded-b-lg">
        <div>
          {editor.isEmpty && <span className="text-destructive">Content is empty</span>}
        </div>
        <div className="flex gap-4">
          <span>{words} words</span>
          <span>{characters} characters</span>
        </div>
      </div>

      <LinkEditorModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSave={handleLinkSave}
        onRemove={handleLinkRemove}
        initialUrl={getCurrentLinkUrl()}
        initialOpenInNewTab={isCurrentLinkTargetBlank()}
      />

      <ImageUpload
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};
