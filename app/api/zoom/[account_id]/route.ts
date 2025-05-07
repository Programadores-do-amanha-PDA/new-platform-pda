import { getAccessToken } from "@/utils/apis/zoom/oauth";
import { getMeAccount } from "@/utils/apis/zoom/account";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ account_id: string }> }
) {
  try {
    const { account_id } = await params;
    console.log(account_id);
    const { client_id, client_secret } = await req.json();
    console.log(client_id, client_secret);
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

    const account = await getMeAccount(token);

    console.log(account);

    return Response.json({ results: account }, { status: 200 });
  } catch (error) {
    console.log("Error in GET account request:", error);
    return Response.json({}, { status: 500 });
  }
}
