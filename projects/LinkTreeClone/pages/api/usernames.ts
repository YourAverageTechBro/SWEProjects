import { NextApiRequest, NextApiResponse } from "next";
import { Database } from "@/types/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Data = {
  error?: string;
  usernames?: Database["public"]["Tables"]["Users"]["Row"]["username"][];
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "GET") {
      await handleGet(req, res);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
const handleGet = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });

  const { data, error } = await supabaseServerClient
    .from("Users")
    .select("username");
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json({ usernames: data.map((data) => data.username) });
  }
};
