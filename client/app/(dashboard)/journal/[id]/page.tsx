import Editor from "@/components/Editor";
import { getUserByClerkID } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface Params {
  id: string;
}

const getEntry = async (id: string) => {
  const user = await getUserByClerkID();
  const entry = await prisma.journalEntry.findUnique({
    where: {
      userId_id: {
        userId: user.id,
        id,
      },
    },
    include: {
      analysis: true,
    },
  });

  return entry;
};

const JournalEditorPage = async ({ params }: { params: Params }) => {
  const entry = await getEntry(params.id);

  return (
    <div className="w-full h-full">
      {entry ? <Editor entry={entry} /> : <div>Entry not found</div>}
    </div>
  );
};

export default JournalEditorPage;
