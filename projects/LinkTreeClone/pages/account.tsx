import Header from "@/Components/common/Header";
import UsernameEditor from "@/Components/Account/UsernameEditor";
import { GetServerSideProps } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Props = {
  username: string;
};
export default function Account({ username }: Props) {
  return (
    <div className={"min-h-screen"}>
      <Header />
      <UsernameEditor username={username} />
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

  return {
    props: {
      username: user.username,
    },
  };
};
