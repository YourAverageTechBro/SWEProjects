import {
  DiffEditor,
  Editor,
  type Monaco,
  type MonacoDiffEditor,
} from "@monaco-editor/react";
import prettier from "prettier/standalone";
import parserTypeScript from "prettier/parser-typescript";
import { type editor } from "monaco-editor";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { type CodeBlocks } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { debounce } from "throttle-debounce";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  codeBlocks?: CodeBlocks[];
  instructionsId: string;
  previousInstructionCodeBlocks?: CodeBlocks[];
  viewDiff: boolean;
  isAuthor: boolean;
};
export default function DraftCodeBlocks({
  codeBlocks,
  instructionsId,
  previousInstructionCodeBlocks,
  viewDiff,
  isAuthor,
}: Props) {
  const [focusedCodeBlock, setFocusedCodeBlock] = useState(
    codeBlocks ? codeBlocks[0] : undefined
  );
  const [currentlyEditingCodeBlock, setCurrentlyEditingCodeBlock] = useState<
    CodeBlocks | undefined
  >();
  const [isInitialized, setIsInitialized] = useState(false);

  const ctx = api.useContext();

  const debouncedSave = useCallback(
    debounce(1000, (codeBlockId: string, code: string, fileName: string) => {
      updateCodeBlock({ codeBlockId, code, fileName });
    }),
    []
  );

  useEffect(() => {
    try {
      if (!focusedCodeBlock) return;
      const { code, fileName, id } = focusedCodeBlock;
      if (code !== undefined && isAuthor) {
        const value = prettier.format(code, {
          parser: "typescript",
          plugins: [parserTypeScript],
        });
        debouncedSave(id, value, fileName);
      }
    } catch (error) {
      toast.error(
        "We found an error in the code and couldn't save it. Please fix the error and try again."
      );
    }
  }, [focusedCodeBlock]);

  const { mutate: updateCodeBlock, isLoading: isUpdatingCodeBlock } =
    api.codeBlocks.update.useMutation({
      onSuccess: (project) => {
        if (!isInitialized) {
          setIsInitialized(true);
        } else {
          // Show successfully saved state
          toast.success("Saved!");
        }
        setCurrentlyEditingCodeBlock(undefined);
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to save! Please try again later.");
        }
      },
    });

  const { mutate: createNewCodeBlock, isLoading: isCreatingNewCodeBlock } =
    api.codeBlocks.create.useMutation({
      onSuccess: (project) => {
        // Show successfully saved state
        toast.success("Saved!");
        void ctx.projects.getById.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to save! Please try again later.");
        }
      },
    });

  const { mutate: deleteCodeBlock, isLoading: isDeletingCodeBlock } =
    api.codeBlocks.delete.useMutation({
      onSuccess: () => {
        // Show successfully saved state
        toast.success("Saved!");
        void ctx.projects.getById.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to save! Please try again later.");
        }
      },
    });

  const handleEditorChange = (
    value: string | undefined,
    _: editor.IModelContentChangedEvent
  ) => {
    setCode(value ?? "");
  };

  const setCode = (value: string) => {
    const codeBlock = codeBlocks?.find(
      (codeBlock) => codeBlock.id === focusedCodeBlock?.id
    );
    if (codeBlock) {
      setFocusedCodeBlock({ ...codeBlock, code: value });
    }
  };

  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.Preserve,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        esModuleInterop: true,
      });
    },
    []
  );

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

  const addNewCodeBlock = () => {
    createNewCodeBlock({
      instructionsId,
    });
  };

  function handleEnterKeyPress<T = Element>(f: () => void) {
    return handleKeyPress<T>(f, "Enter");
  }

  function handleKeyPress<T = Element>(f: () => void, key: string) {
    return (e: KeyboardEvent<T>) => {
      if (e.key === key) {
        f();
      }
    };
  }

  const renameCodeBlock = () => {
    if (!currentlyEditingCodeBlock) return;
    updateCodeBlock({
      codeBlockId: currentlyEditingCodeBlock.id,
      code: currentlyEditingCodeBlock.code,
      fileName: currentlyEditingCodeBlock.fileName,
    });
  };

  return (
    <div className={"flex w-2/3 flex-col"}>
      <div className={"overflow-x-scroll border-b "}>
        <div className={"flex items-center"}>
          {codeBlocks?.map((codeBlock, index) => (
            <div
              className={`w-auto border px-4 py-2 hover:cursor-pointer hover:bg-gray-200
                ${focusedCodeBlock === codeBlock ? "bg-gray-200" : ""}
                `}
              key={index}
              onClick={() => {
                if (focusedCodeBlock === codeBlock) {
                  setCurrentlyEditingCodeBlock(codeBlock);
                } else {
                  setFocusedCodeBlock(codeBlock);
                }
              }}
            >
              {currentlyEditingCodeBlock?.id === codeBlock.id ? (
                <div className={"flex items-center gap-2"}>
                  <input
                    className={"rounded border p-1"}
                    value={currentlyEditingCodeBlock.fileName}
                    onChange={(e) =>
                      setCurrentlyEditingCodeBlock({
                        ...currentlyEditingCodeBlock,
                        fileName: e.target.value,
                      })
                    }
                    onKeyDown={handleEnterKeyPress(renameCodeBlock)}
                  />
                </div>
              ) : (
                <div className={"flex items-center gap-2"}>
                  {codeBlock.fileName}
                  <button
                    className={"hover:bg-gray-200"}
                    onClick={(e) => {
                      deleteCodeBlock({ codeBlockId: codeBlock.id });
                      e.stopPropagation();
                    }}
                  >
                    <XMarkIcon className={"h-4 w-4 text-red-500"} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {isAuthor && (
            <div
              className={
                "w-auto border p-2 hover:cursor-pointer hover:bg-gray-200"
              }
              onClick={addNewCodeBlock}
            >
              <PlusIcon className={"h-6 w-6"} />
            </div>
          )}
        </div>
        {viewDiff ? (
          <DiffEditor
            height={"100vh"}
            theme="vs-dark"
            language={"typescript"}
            original={
              previousInstructionCodeBlocks?.find(
                (codeBlock: CodeBlocks) =>
                  codeBlock.fileName === focusedCodeBlock?.fileName
              )?.code
            }
            modified={focusedCodeBlock?.code}
            onMount={handleDiffEditorDidMount}
            options={{
              renderSideBySide: false,
              readOnly: !isAuthor,
            }}
          />
        ) : (
          <Editor
            defaultLanguage="typescript"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            value={focusedCodeBlock?.code}
          />
        )}
      </div>
    </div>
  );
}
