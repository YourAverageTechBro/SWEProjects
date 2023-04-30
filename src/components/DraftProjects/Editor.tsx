// import logo from './logo.svg'
import "@blocknote/core/style.css";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { type Block, type BlockNoteEditor } from "@blocknote/core";
import { type Dispatch, type SetStateAction } from "react";

type Props = {
  initialValue: Block[] | undefined;
  onChange: Dispatch<SetStateAction<Block[] | undefined>>;
};
function Editor({ initialValue, onChange }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
  const editor: BlockNoteEditor | null = useBlockNote({
    onEditorContentChange: (editor: BlockNoteEditor) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      onChange(editor.topLevelBlocks);
    },
    initialContent: initialValue ?? undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return <BlockNoteView editor={editor} />;
}

export default Editor;
