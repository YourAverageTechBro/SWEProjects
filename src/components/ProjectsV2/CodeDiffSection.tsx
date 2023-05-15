import {
  DiffEditor,
  type Monaco,
  type MonacoDiffEditor,
} from "@monaco-editor/react";
import { useCallback } from "react";

type Props = {
  originalCode: string;
  modifiedCode: string;
  isAuthor: boolean;
};
export default function CodeDiffSection({
  originalCode,
  modifiedCode,
  isAuthor,
}: Props) {
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
      height={"100%"}
      theme="vs-dark"
      language={"typescript"}
      original={originalCode}
      modified={modifiedCode}
      onMount={handleDiffEditorDidMount}
      options={{
        renderSideBySide: false,
        readOnly: !isAuthor,
      }}
    />
  );
}
