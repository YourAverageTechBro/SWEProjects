import { ClipboardIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Database } from "@/types/supabase";
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
    <div className="w-1/2 flex flex-col items-center">
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
        <p className="text-lg font-bold mb-4">{`${process.env.NEXT_PUBLIC_BASE_URL}/${username}`}</p>
        <button className="ml-4 mb-4 px-4 py-2 border rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex">
          <ClipboardIcon className="h-6 w-6" /> copy{" "}
        </button>
        <div
          className={`ease-in-out transition-all absolute right-8 top-1 mt-16 px-4 py-2 border rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center ${
            shouldShowSuccessToast ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShouldShowSuccessToast(false)}
        >
          <p> Link copied! </p>
          <XMarkIcon className="h-4 w-4 hover:cursor-pointer" />
        </div>
      </div>
      <div
        className="text-center border-black border-8 radius-1/2 rounded-3xl"
        style={{ height: "844px", width: "390px" }}
      >
        <div className="flex flex-col justify-center m-8 overflow-scroll h-full">
          {links.map((link) => (
            <Link
              className={"w-full p-8 bg-white rounded-lg border"}
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
