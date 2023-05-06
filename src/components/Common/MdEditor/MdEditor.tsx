import { type Dispatch, type SetStateAction } from "react";
import { onImagePasted } from "./utils";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

type Props = {
  value: string | undefined;
  onChange: Dispatch<SetStateAction<string | undefined>>;
  index: number;
  hideToolbar: boolean;
  preview: "edit" | "preview" | "live";
  height: string;
};
const MdEditor = ({
  value,
  onChange,
  index,
  preview,
  hideToolbar,
  height,
}: Props) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_SECRET_KEY ?? ""
  );

  // eslint-disable @typescript-eslint/ban-ts-comment
  return (
    <MDEditor
      value={value}
      preview={preview}
      hideToolbar={hideToolbar}
      onChange={(value) => {
        onChange(value);
      }}
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      onPaste={async (event) => {
        await onImagePasted(event.clipboardData, onChange, supabase, index);
      }}
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      onDrop={async (event) => {
        await onImagePasted(event.dataTransfer, onChange, supabase, index);
      }}
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      /* @ts-ignore */
      height={height}
    />
  );
};

export default MdEditor;
