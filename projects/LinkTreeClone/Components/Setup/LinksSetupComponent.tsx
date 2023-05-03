import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

type Props = {
  links: Database["public"]["Tables"]["Links"]["Row"][];
};
export default function LinksSetupComponent({ links }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const router = useRouter();

  const refreshPage = () => router.replace(router.asPath);

  const user = useUser();

  const addLink = async () => {
    try {
      if (!user) {
        alert("You must be logged in to add a link");
        return;
      }

      const resp = await fetch("/api/links", {
        method: "POST",
        body: JSON.stringify({
          url,
          title,
          userId: user.id,
        }),
      });
      const json = await resp.json();
      if (json.error) {
        alert(json.error);
      } else {
        resetState();
        void refreshPage();
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteLink = async (linkId: number) => {
    try {
      if (!user) {
        alert("You must be logged in to delete a link");
        return;
      }

      const resp = await fetch(
        `/api/links?userId=${user.id}&linkId=${linkId}`,
        {
          method: "DELETE",
        }
      );
      const json = await resp.json();
      if (json.error) {
        alert(json.error);
      } else {
        void refreshPage();
        resetState();
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const resetState = () => {
    setUrl("");
    setTitle("");
  };

  return (
    <div className={"w-1/2"}>
      <div className={"m-8 p-8 bg-white rounded-lg border w-full"}>
        <p className={"text-4xl"}> Enter URL and Title</p>
        <input
          className="mt-8 w-full rounded-md border py-4 text-gray-900 shadow-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="mt-8 w-full rounded-md border py-4 text-gray-900 shadow-sm"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="mt-8 rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={addLink}
        >
          Add Link
        </button>
      </div>
      {links.map((link) => (
        <div
          key={link.id}
          className={
            "w-full m-8 p-8 bg-white rounded-lg border flex justify-between"
          }
        >
          <div>
            <p className={"text-4xl"}> {link.title}</p>
            <p className={"text-2xl"}> {link.url}</p>
          </div>
          <button onClick={() => deleteLink(link.id)}>
            <XMarkIcon className="h-12 w-12 text-red-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
