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
      <div className="w-1/2 pl-4 mt-4">
        <h2 className="text-xl font-bold text-center pb-2 mb-2">
          Sentiment Score
        </h2>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-500 to-yellow-500"
              style={{
                width: "50%",
              }}
            />
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-yellow-500 to-green-500"
              style={{
                width: "50%",
              }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-500">-10</span>
            <span className="text-green-500">10</span>
          </div>
          <div
            className="absolute top-0 left-0 h-3 w-3 rounded-full bg-gray-500 shadow-md border-2 border-white"
            style={{
              left: `${((avg + 10) / 20) * 100}%`,
            }}
          />
        </div>
        {avg ? (
          <p className="text-white mt-2 text-center">Averge: {avg}</p>
        ) : (
          <p className="text-gray-500 mt-2 text-center">
            Your journal entries have not been analyzed yet.
          </p>
        )}
      </div>
      <div className="w-1/2 h-1/2">
        <HistoryChart data={analyses} />
      </div>
    </div>
  );
};

export default History;
