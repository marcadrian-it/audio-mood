import { analyze } from "@/utils/ai";
import { getUserByClerkID } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

export const PATCH = async (
  request: Request,
  { params }: { params: Params }
) => {
  const { content } = await request.json();
  const user = await getUserByClerkID();
  const updatedEntry = await prisma.journalEntry.update({
    where: {
      userId_id: {
        userId: user.id,
        id: params.id,
      },
    },
    data: {
      content: content,
    },
  });

  //Store color as a string in the database
  const analysis = await analyze(updatedEntry.content);
  let colorString = "[]";
  if (analysis && analysis.color) {
    colorString = JSON.stringify(analysis.color);
  }

  await prisma.analysis.upsert({
    where: {
      entryId: updatedEntry.id,
    },
    create: {
      userId: user.id,
      entryId: updatedEntry.id,
      ...analysis,
      color: colorString,
    },
    update: { ...analysis, color: colorString },
  });

  return NextResponse.json({ data: updatedEntry, analysis: analysis });
};
