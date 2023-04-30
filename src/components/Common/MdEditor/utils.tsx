import type { SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

export const insertTextToArea = (
  insertString: string,
  textAreaIndex: number
) => {
  const textareas = document.querySelectorAll(
    "textarea.w-md-editor-text-input"
  );
  if (textareas.length === 0) {
    return null;
  }
  const textarea = textareas[textAreaIndex] as HTMLTextAreaElement;
  if (!textarea) return null;

  let sentence = textarea.value;
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const front = sentence.slice(0, pos);
  const back = sentence.slice(pos, len);

  sentence = front + insertString + back;

  textarea.value = sentence;
  textarea.selectionEnd = end + insertString.length;

  return sentence;
};

export const onImagePasted = async (
  dataTransfer: DataTransfer,
  setMarkdown: (value: SetStateAction<string | undefined>) => void,
  supabase: SupabaseClient,
  textAreaIndex: number
) => {
  const files: File[] = [];
  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    const file = dataTransfer.files.item(index);

    if (file) {
      files.push(file);
    }
  }

  await Promise.all(
    files.map(async (file) => {
      const url = await fileUpload(file, supabase);
      const insertedMarkdown = insertTextToArea(`![](${url})`, textAreaIndex);
      if (!insertedMarkdown) {
        return;
      }
      setMarkdown(insertedMarkdown);
    })
  );
};

export const fileUpload = async (file: File, supabase: SupabaseClient) => {
  const { data, error } = await supabase.storage
    .from("public/images")
    .upload(`public/images${file.name}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;
  const resp = supabase.storage.from("public/images").getPublicUrl(data.path);
  return resp.data.publicUrl;
};
