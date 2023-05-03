import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";

type Props = {
  username: string;
};
export default function UsernameEditor({ username }: Props) {
  const [newUsername, setNewUsername] = useState(username);
  const user = useUser();

  const saveUsername = async () => {
    try {
      const resp = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          username: newUsername,
        }),
      });
      const json = await resp.json();
      if (json.error) {
        alert(json.error);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className={"w-full flex justify-center"}>
      <div className={"w-1/2 m-8 p-8 bg-white rounded-lg border "}>
        <p className={"text-4xl"}> Enter URL and Title</p>
        <input
          className="mt-8 w-full rounded-md border py-4 text-gray-900 shadow-sm"
          placeholder="Title"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <button
          className="w-full mt-8 rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={saveUsername}
        >
          Save
        </button>
      </div>
    </div>
  );
}
