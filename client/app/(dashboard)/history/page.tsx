import HistoryChart from "@/components/HistoryChart";
import { getUserByClerkID } from "@/utils/auth";
import { prisma } from "@/utils/db";

const getData = async () => {
  const user = await getUserByClerkID();
  const analyses = await prisma.analysis.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const sum = analyses.reduce(
    (all, curr) => all + (curr.sentimentScore || 0),
    0
  );
  const avg = Math.round((sum / analyses.length) * 10) / 10;
  return { analyses, avg };
};

const History = async () => {
  const { avg, analyses } = await getData();

  return (
    <div className="w-full h-full">
      <div>{`Avg. Sentiment ${avg}`}</div>
      <div className="w-1/2 h-1/2">
        <HistoryChart data={analyses} />
      </div>
    </div>
  );
};

export default History;
