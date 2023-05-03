import { NextApiRequest, NextApiResponse } from "next";
import { Database } from "../../types/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Data = {
  error?: string;
  links?: Database["public"]["Tables"]["Links"]["Row"][];
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "POST") {
      await handlePost(req, res);
    } else if (req.method === "GET") {
      await handleGet(req, res);
    } else if (req.method === "DELETE") {
      await handleDelete(req, res);
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
  const { url, title, userId } = body as {
    url: string;
    title: string;
    userId: string;
  };

  if (!url || !title || !userId) {
    res.status(400).json({ error: "Missing url, title, or userId" });
    return;
  }

  const { error: insertError } = await supabaseServerClient
    .from("Links")
    .insert({
      url,
      title,
      user_id: userId,
    });

  if (insertError) {
    res.status(500).json({ error: insertError.message });
  } else {
    res.status(200).json({});
  }
};

const handleGet = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  const { data, error } = await supabaseServerClient
    .from("Links")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json({ links: data });
  }
};

const handleDelete = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
  const { linkId, userId } = req.query;

  if (!userId || !linkId) {
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  const { error: deleteError } = await supabaseServerClient
    .from("Links")
    .delete()
    .eq("user_id", userId)
    .eq("id", linkId);
  if (deleteError) {
    res.status(500).json({ error: deleteError.message });
  } else {
    res.status(200).json({});
  }
};
