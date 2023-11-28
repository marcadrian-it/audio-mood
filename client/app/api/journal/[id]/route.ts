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
  console.log("Start PATCH");
  const { content } = await request.json();
  console.log("Content:", content);

  const user = await getUserByClerkID();
  console.log("User:", user);

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
  console.log("Updated entry:", updatedEntry);

  const analysis = await analyze(updatedEntry.content);
  console.log("Analysis:", analysis);

  let colorString = "[]";
  if (analysis && analysis.color) {
    colorString = JSON.stringify(analysis.color);
  }
  console.log("Color string:", colorString);

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
  console.log("Upserted analysis");

  console.log("End PATCH");
  return NextResponse.json({ data: updatedEntry, analysis: analysis });
};
