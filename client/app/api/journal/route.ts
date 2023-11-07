import { getUserByClerkID } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export const POST = async () => {
  const user = await getUserByClerkID();
  const entry = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content:
        "Share your day with us! Mood analysis will begin shortly after you finish writing.",
    },
  });

  return NextResponse.json({
    data: entry,
  });
};
