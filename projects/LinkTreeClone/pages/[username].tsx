import { GetServerSideProps } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

type Props = {
  links: Database["public"]["Tables"]["Links"]["Row"][];
  username: string;
};
export default function CreatorPage({ links, username }: Props) {
  return (
    <div className={"min-h-screen flex flex-col items-center mt-36"}>
      <h1 className={"text-2xl font-bold"}>Links for {username}</h1>
      <div className="flex flex-col justify-center m-8 overflow-scroll h-full w-96 gap-8">
        {links.map((link) => (
          <Link
            className={"w-full p-8 bg-white rounded-lg border text-center"}
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
