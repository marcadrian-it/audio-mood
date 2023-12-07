import { formatDate } from "@/utils/formatDate";
interface Analysis {
  color: string | null;
  summary: string | null;
  mood: string | null;
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
    try {
      colorArray = JSON.parse(entry.analysis.color);
    } catch (error) {
      console.error("Invalid color data:", entry.analysis.color);
    }
  }
  const gradient = `radial-gradient(circle, ${colorArray[0]}, ${colorArray[1]}, white)`;

  return (
    <div
      data-testid="entry-card"
      className={`hover:border-[4px] hover:border-[#1d113a] overflow-hidden rounded-lg shadow-xl text-black font-semibold relative border-[3px] border-black h-64 duration-100 ease-in-out flex flex-col items-start justify-center pl-4 gap-2`}
      style={{ background: `${gradient}` }}
    >
      <span className="px-4 py-1 bg-black text-xs rounded-xl text-white font-medium ">
        {date}
      </span>
      <div className="px-4 py-3 text-2xl font-extrabold bg-white hover:bg-white/80 duration-100 ease-in-out rounded-xl border-black border-[2px] mt-4 ms-2 me-2">
        {entry.analysis?.summary}
      </div>
      <div className="w-full flex justify-center mt-2">
        <span className="px-4 py-1 text-medium font-bold text-center bg-white rounded-[50px] border-black border-[2px] ms-2 hover:bg-white/80 duration-100 ease-in-out">
          {entry.analysis?.mood}
        </span>
      </div>
      <div className="absolute inset-0 bg-white bg-opacity-0 pointer-events-none blur-sm" />
    </div>
  );
};

export default EntryCard;
