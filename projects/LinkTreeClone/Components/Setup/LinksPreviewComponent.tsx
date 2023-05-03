import { ClipboardIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Database } from "../../types/supabase";
import Link from "next/link";

type Props = {
  username: string;
  links: Database["public"]["Tables"]["Links"]["Row"][];
};
export default function LinksPreviewComponent({ links, username }: Props) {
  const [shouldShowSuccessToast, setShouldShowSuccessToast] =
    useState<boolean>(false);
  const showSuccessToast = () => {
    setShouldShowSuccessToast(true);
    setTimeout(() => {
      setShouldShowSuccessToast(false);
    }, 3000);
  };
  return (
    <div className="flex w-1/2 flex-col items-center">
      <div
        className="flex items-center hover:cursor-pointer"
        onClick={async (event) => {
          event.preventDefault();
          await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_BASE_URL}/${username}`
          );
          showSuccessToast();
        }}
      >
        <p className="mb-4 text-lg font-bold">{`${process.env.NEXT_PUBLIC_BASE_URL}/${username}`}</p>
        <button className="mb-4 ml-4 flex rounded-md border bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <ClipboardIcon className="h-6 w-6" /> copy{" "}
        </button>
        <div
          className={`absolute right-8 top-1 mt-16 flex items-center rounded-md border bg-green-500 px-4 py-2 text-white shadow-sm transition-all ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            shouldShowSuccessToast ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShouldShowSuccessToast(false)}
        >
          <p> Link copied! </p>
          <XMarkIcon className="h-4 w-4 hover:cursor-pointer" />
        </div>
      </div>
      <div
        className="radius-1/2 rounded-3xl border-8 border-black text-center"
        style={{ height: "844px", width: "390px" }}
      >
        <div className="m-8 flex h-full flex-col justify-center overflow-scroll">
          {links.map((link) => (
            <Link
              className={"w-full rounded-lg border bg-white p-8"}
              key={link.id}
              href={link.url}
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
