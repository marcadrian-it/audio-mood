import { formatDate } from "@/utils/formatDate";
interface Analysis {
  color: string;
  summary: string;
  mood: string;
}

interface Entry {
  createdAt: Date;
  analysis: Analysis | null;
  content: string;
}

interface EntryCardProps {
  entry: Entry;
}

const EntryCard = ({ entry }: EntryCardProps) => {
  const date = formatDate(entry.createdAt);
  let colorArray = ["#ffffff", "#ffffff"];
  if (entry?.analysis?.color) {
    colorArray = JSON.parse(entry.analysis.color);
  }
  const gradient = `radial-gradient(circle, ${colorArray[0]}, ${colorArray[1]}, white)`;

  return (
    <div
      data-testid="entry-card"
      className={`overflow-hidden rounded-lg shadow-xl text-black font-semibold relative border-[6px] border-blue-500/40 h-64`}
      style={{ background: `${gradient}` }}
    >
      <div className="relative z-10">
        <div className="px-4 py-5 font-extrabold">{date}</div>
        <div className="px-4 py-5 bg-clip-text text-transparent bg-gradient-to-r from-black to-black/90 text-2xl font-extrabold">
          {entry.analysis?.summary}
        </div>
        <div className="px-4 py-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-500 text-2xl font-extrabold">
          {entry.analysis?.mood}
        </div>
      </div>
      <div className="absolute inset-0 bg-white bg-opacity-30 pointer-events-none blur-sm" />
    </div>
  );
};

export default EntryCard;
