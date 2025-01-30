import {
  adminCreateUser,
  adminDeleteUser,
  adminGetAllUsers,
  adminUpdateUser,
} from "@/utils/supabase/actions/auth_admin";
import { getProfileById } from "@/utils/supabase/actions/profiles";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const responseData = await adminGetAllUsers();
    if (!responseData) {
      throw new Error("no admin get users data returned");
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
    console.log("Error GET /api/auth_users", error);
    return NextResponse.json({ status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (
      !data.email ||
      !data.password ||
      !data.user_metadata ||
      !data.user_metadata.full_name ||
      !data.user_metadata.user_email
    ) {
      throw new Error("invalid user data");
    }

    const userAuthCreated = await adminCreateUser(data);
    if (!userAuthCreated) {
      throw new Error("no admin user create data returned");
    }

    const userProfileCreated = await getProfileById(userAuthCreated.id);

    if (!userProfileCreated) {
      throw new Error("no get profile data returned");
    }

    return NextResponse.json(
      { new_user: { ...userAuthCreated, profile: userProfileCreated } },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error POST /api/auth_users", error);
    return NextResponse.json({ status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, updates } = await req.json();
    if (!id || !updates) {
      throw new Error("id and updates fields are required");
    }

    const responseData = await adminUpdateUser(id, updates);

    if (!responseData) {
      throw new Error("no admin update user data returned");
    }
    return NextResponse.json({ updatedUser: responseData }, { status: 201 });
  } catch (error) {
    console.log("Error PUT /api/auth_users", error);
    return NextResponse.json({ status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      throw new Error("user id is required");
    }

    const responseData = await adminDeleteUser(id);

    if (!responseData) {
      throw new Error("admin delete user response is false");
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("Error DELETE /api/auth_users", error)
    return NextResponse.json({ status: 401 });
  }
}
