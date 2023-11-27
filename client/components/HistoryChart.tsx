"use client";

import { formatDate } from "@/utils/formatDate";
import { ResponsiveContainer, Line, XAxis, Tooltip, LineChart } from "recharts";
interface Analysis {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  entryId: string;
  userId: string;
  sentimentScore: number | null;
  mood: string | null;
  summary: string | null;
  color: string | null;
  negative: boolean | null;
  subject: string | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: Analysis }[];
  label?: Date;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  payload,
  label,
  active,
}) => {
  if (!label) return null;
  const dateLabel = formatDate(label);
  if (active && payload) {
    const { mood } = payload[0].payload;
    return (
      <div className="p-8 custom-tooltip bg-white/5 shadow-md border border-black/10 rounded-lg backdrop-blur-md relative">
        <div className="absolute left-2 top-2 w-2 h-2 rounded-full"></div>
        <p className="label text-sm text-white/30">{dateLabel}</p>
        <p className="intro text-xl uppercase">{mood}</p>
      </div>
    );
  }
  return null;
};

interface HistoryChartProps {
  data: Analysis[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart width={300} height={100} data={data}>
        <Line
          dataKey="sentimentScore"
          type="monotone"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <XAxis dataKey="createdAt" />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
