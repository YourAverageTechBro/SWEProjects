import { GetServerSideProps } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../types/supabase";
import Link from "next/link";

type Props = {
  links: Database["public"]["Tables"]["Links"]["Row"][];
  username: string;
};
export default function CreatorPage({ links, username }: Props) {
  return (
    <div className={"mt-36 flex min-h-screen flex-col items-center"}>
      <h1 className={"text-2xl font-bold"}>Links for {username}</h1>
      <div className="m-8 flex h-full w-96 flex-col justify-center gap-8 overflow-scroll">
        {links.map((link) => (
          <Link
            className={"w-full rounded-lg border bg-white p-8 text-center"}
            key={link.id}
            href={link.url}
          >
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient(context);
  const { username } = context.params as { username: string };
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !username)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  const { data: user, error: fetchUsernameError } = await supabase
    .from("Users")
    .select("*")
    .eq("username", username)
    .single();

  if (fetchUsernameError) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { data: links, error: fetchLinksError } = await supabase
    .from("Links")
    .select("*")
    .eq("user_id", user.id);

  if (fetchLinksError) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      links,
      username,
    },
  };
};
