import React from 'react';
import { BubbleMenu as TiptapBubbleMenu, Editor } from '@tiptap/react';
import { Bold, Italic, Link as LinkIcon, Highlighter } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorBubbleMenuProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
}

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor, onOpenLinkModal }) => {
  if (!editor) return null;

  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon, 
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    label: string; 
  }) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle 
            size="sm" 
            pressed={isActive} 
            onPressedChange={onClick} 
            aria-label={label}
            className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <Icon className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <TiptapBubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100 }}
      className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md"
    >
      <MenuButton
        label="Bold"
        icon={Bold}
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <MenuButton
        label="Italic"
        icon={Italic}
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <MenuButton
        label="Highlight"
        icon={Highlighter}
        isActive={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
      <MenuButton
        label="Link"
        icon={LinkIcon}
        isActive={editor.isActive('link')}
        onClick={onOpenLinkModal}
      />
    </TiptapBubbleMenu>
  );
};
