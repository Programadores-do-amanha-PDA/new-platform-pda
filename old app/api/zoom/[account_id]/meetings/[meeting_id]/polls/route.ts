import { getPastMeetingPolls } from "@/utils/apis/zoom/meetings";
import { getAccessToken } from "@/utils/apis/zoom/oauth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ account_id: string; meeting_id: string }> }
) {
  try {
    const { account_id, meeting_id } = await params;
    const { client_id, client_secret } = await req.json();

    if (!account_id || !meeting_id) {
      throw new Error("Missing account id or meeting id parameters");
    }

    const token = await getAccessToken({
      account_id,
      client_id,
      client_secret,
    });

    if (!token) {
      throw new Error("Failed to get access token");
    }

    const decodedMeetingId = decodeURIComponent(
      decodeURIComponent(meeting_id as string)
    );

    const pollResults = await getPastMeetingPolls(decodedMeetingId, token);
    return Response.json(
      {
        results: pollResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in GET poll results request:", error);
    return Response.json({}, { status: 500 });
  }
}
