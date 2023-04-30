import {
  createServerSupabaseClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    if (req.method === "POST") {
      const { score } = JSON.parse(req.body);
      await handlePost(supabase, score, res);
    } else if (req.method === "GET") {
      await handleGet(supabase, res);
    }
  } catch (error: any) {
    res.status(500).json({ name: error.message });
  }
}

const handlePost = async (
  supabase: SupabaseClient,
  score: number,
  res: NextApiResponse
) => {
  const { error } = await supabase.from("scores").insert({ score });
  if (error) throw error;
  res.status(200).send("OK");
};

const handleGet = async (supabase: SupabaseClient, res: NextApiResponse) => {
  const { data, error } = await supabase
    .from("scores")
    .select("score")
    .order("score", { ascending: false })
    .limit(10);
  if (error) throw error;
  res.status(200).json({ data: data.map((d) => d.score) });
};
