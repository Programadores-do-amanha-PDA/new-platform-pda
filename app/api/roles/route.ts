import {
  deleteUserRoleWithUserId,
  getAllUserRoles,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const responseData = await getAllUserRoles();

    if (!responseData) {
      throw new Error("no get all user roles data was returned");
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
    console.log("Error GET /api/roles", error);
    return NextResponse.json({ status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    if (!userId || !role) {
      throw new Error("user id and role fields are required");
    }

    const responseData = await insertUserRoleWithUserId(userId, role);

    if (!responseData) {
      throw new Error("no insert user role with user id data was returned");
    }

    return NextResponse.json({ results: responseData }, { status: 201 });
  } catch (error) {
    console.log("Error POST /api/roles", error);
    return NextResponse.json({ status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { role, id } = await req.json();
    if (!id || !role) {
      throw new Error("role and id fields are required");
    }
    const responseData = await updateUserRoleWIthUserId(id, role);
    if (!responseData) {
      throw new Error("no update user role data was returned");
    }
    return NextResponse.json({ results: responseData }, { status: 201 });
  } catch (error) {
    console.log("Error PUT /api/roles", error);
    return NextResponse.json({ status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) throw new Error("id is undefined");

    const responseData = await deleteUserRoleWithUserId(id);
    if (!responseData) {
      throw new Error("delete response data is false");
    }
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("Error DELETE /api/roles", error);
    return NextResponse.json({ status: 401 });
  }
}
