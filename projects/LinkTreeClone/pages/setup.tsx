import { Database } from "@/types/supabase";
import LinksPreviewComponent from "@/Components/Setup/LinksPreviewComponent";
import LinksSetupComponent from "@/Components/Setup/LinksSetupComponent";
import Header from "@/Components/common/Header";
import { GetServerSideProps } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Props = {
  links: Database["public"]["Tables"]["Links"]["Row"][];
  username: string;
};
export default function Setup({ links, username }: Props) {
  return (
    <div className={"min-h-screen"}>
      <Header />
      <div className={"flex"}>
        <LinksSetupComponent links={links} />
        <LinksPreviewComponent username={username} links={links} />
      </div>
    </div>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient(context);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user.id;
  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { data: user, error: fetchUsernameError } = await supabase
    .from("Users")
    .select("*")
    .eq("id", userId)
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
    .eq("user_id", userId);

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
      username: user.username,
    },
  };
};
