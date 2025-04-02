import { getPastedMeetingDetails } from "@/utils/apis/zoom/meetings";
import { getAccessToken } from "@/utils/apis/zoom/oauth";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(
  req: NextApiRequest,
  res: NextApiResponse,
  { params }: { params: Promise<{ account_id: string; meeting_id: string }> }
) {
  try {
    const { account_id, meeting_id } = await params;

    if (!account_id || !meeting_id) {
      throw new Error("Missing account id or meeting id parameters");
    }

    const token = await getAccessToken({
      account_id: account_id,
      token_key: `zoom_access_token_key_${account_id}`,
    });

    if (!token) {
      throw new Error("Failed to get access token");
    }

    const meeting = await getPastedMeetingDetails(meeting_id, token);
    return res.status(200).json({ results: meeting });
  } catch (error) {
    console.log("Error in GET meetings request:", error);
    return res.status(500).send({});
  }
}
