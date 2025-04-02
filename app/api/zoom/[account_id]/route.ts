import type { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "@/utils/apis/zoom/oauth";
import { getMeAccount } from "@/utils/apis/zoom/account";

export async function GET(
  req: NextApiRequest,
  res: NextApiResponse,
  { params }: { params: Promise<{ account_id: string }> }
) {
  try {
    const { account_id } = await params;
    if (!account_id) {
      throw new Error("Missing account id parameters");
    }

    const token = await getAccessToken({
      account_id: account_id,
      token_key: `zoom_access_token_key_${account_id}`,
    });

    if (!token) {
      throw new Error("Failed to get access token");
    }

    const account = await getMeAccount(token);

    return res.status(200).json({ results: account });
  } catch (error) {
    console.log("Error in GET meetings request:", error);
    return res.status(500).send({});
  }
}
