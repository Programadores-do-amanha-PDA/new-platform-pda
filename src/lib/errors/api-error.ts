import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message, status: false },
      { status: error.statusCode }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    { message: "Internal server error", status: false },
    { status: 500 }
  );
};
