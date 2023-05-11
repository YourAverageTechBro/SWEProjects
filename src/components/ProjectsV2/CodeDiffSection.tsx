import { type CodeBlocks } from "@prisma/client";
import {
  DiffEditor,
  type Monaco,
  type MonacoDiffEditor,
} from "@monaco-editor/react";
import { useCallback } from "react";
import { api } from "~/utils/api";

type Props = {
  codeBlock: CodeBlocks;
  isAuthor: boolean;
};
export default function CodeDiffSection({ codeBlock, isAuthor }: Props) {
  const { data } = api.codeBlocks.getMostRecentDiffForFileName.useQuery({
    fileName: codeBlock.fileName,
    createdAt: codeBlock.createdAt,
    instructionsId: codeBlock.instructionsId,
  });
  const handleDiffEditorDidMount = useCallback(
    (editor: MonacoDiffEditor, monaco: Monaco) => {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.Preserve,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        esModuleInterop: true,
      });
    },
    []
  );
  return (
    <DiffEditor
      theme="vs-dark"
      language={"typescript"}
      original={data?.code}
      modified={codeBlock.code}
      onMount={handleDiffEditorDidMount}
      options={{
        renderSideBySide: false,
        readOnly: !isAuthor,
      }}
    />
  );
}
