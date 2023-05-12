import { Editor, type Monaco } from "@monaco-editor/react";
import prettier from "prettier/standalone";
import parserTypeScript from "prettier/parser-typescript";
import { type editor } from "monaco-editor";
import React, {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { type CodeBlocks, type Instructions } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { debounce } from "throttle-debounce";
import { XMarkIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import CodeDiffSection from "~/components/ProjectsV2/CodeDiffSection";
import InstructionsToolbar from "~/components/ProjectsV2/InstructionsToolbar";

type Props = {
  instruction: Instructions;
  isAuthor: boolean;
  isAdmin: boolean;
  isEditing: boolean;
};
export default function CodeBlocks({
  instruction,
  isAuthor,
  isAdmin,
  isEditing,
}: Props) {
  const { data: codeBlocks = [], isFetching } =
    api.codeBlocks.getCodeBlocksForInstructionId.useQuery(
      {
        instructionsId: instruction.id,
      },
      {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
          setFocusedCodeBlock(data[0]);
        },
      }
    );

  const [viewDiff, setViewDiff] = useState(!isEditing);

  const [focusedCodeBlock, setFocusedCodeBlock] = useState<
    CodeBlocks | undefined
  >();

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

  const { mutate: updateCodeBlock } = api.codeBlocks.update.useMutation({
    onSuccess: () => {
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

  const { mutate: createNewCodeBlock } = api.codeBlocks.create.useMutation({
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

  const { mutate: deleteCodeBlock } = api.codeBlocks.delete.useMutation({
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

  const addNewCodeBlock = () => {
    createNewCodeBlock({
      instructionsId: instruction.id,
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

  if (isFetching) return <LoadingSpinner />;

  return (
    <div className={"flex h-full w-full flex-col"}>
      <div className={"overflow-hidden border-b"}>
        <div className={"flex items-center"}>
          <div className={"flex overflow-x-scroll"}>
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
                    {(isAdmin || isAuthor) && (
                      <button
                        className={"hover:bg-gray-200"}
                        onClick={(e) => {
                          deleteCodeBlock({ codeBlockId: codeBlock.id });
                          e.stopPropagation();
                        }}
                      >
                        <XMarkIcon className={"h-4 w-4 text-red-500"} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

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

        {(isAuthor || isAdmin) && isEditing && (
          <InstructionsToolbar
            viewDiff={viewDiff}
            setViewDiff={setViewDiff}
            currentInstruction={instruction}
            codeBlocks={codeBlocks}
          />
        )}

        {viewDiff && focusedCodeBlock && (
          <CodeDiffSection codeBlock={focusedCodeBlock} isAuthor={isAuthor} />
        )}
        {!viewDiff && focusedCodeBlock && (
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
