import { getAccessToken } from "@/utils/apis/zoom/oauth";
import { getAllMeetingsByAccount } from "@/utils/apis/zoom/meetings";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ account_id: string }> }
) {
  try {
    const { account_id } = await params;
    const { client_id, client_secret } = await req.json();

    if (!account_id || !client_id || !client_secret) {
      throw new Error("Missing account id parameters");
    }

    const token = await getAccessToken({
      account_id,
      client_id,
      client_secret,
    });

    if (!token) {
      throw new Error("Failed to get access token");
    }

    const meetings = await getAllMeetingsByAccount(token);

    return Response.json(
      {
        results: meetings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in GET account request:", error);
    return Response.json({}, { status: 500 });
  }
}
