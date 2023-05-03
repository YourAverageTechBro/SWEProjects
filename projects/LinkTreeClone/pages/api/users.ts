import { NextApiRequest, NextApiResponse } from "next";
import { Database } from "../../types/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Data = {
  error?: string;
  user?: Database["public"]["Tables"]["Users"]["Row"];
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "POST") {
      await handlePost(req, res);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
const handlePost = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
  const body = JSON.parse(req.body);
  const { username, userId } = body as {
    username: string;
    userId: string;
  };

  if (!username || !userId) {
    res.status(400).json({ error: "Missing username or userId" });
    return;
  }

  const { error: updateError } = await supabaseServerClient
    .from("Users")
    .update({
      username,
    })
    .eq("id", userId);

  if (updateError) {
    res.status(500).json({ error: updateError.message });
  } else {
    res.status(200).json({});
  }
};
