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
  const date = new Date(entry.createdAt).toDateString();
  let colorArray = ["#ffffff", "#ffffff"];
  if (entry?.analysis?.color) {
    colorArray = JSON.parse(entry.analysis.color);
  }
  const gradient = `radial-gradient(circle, ${colorArray[0]}, ${colorArray[1]},white)`;

  return (
    <div
      data-testid="entry-card"
      className={`divide-y divide-green-800 overflow-hidden rounded-lg shadow-xl text-black font-semibold relative`}
      style={{ background: `${gradient}` }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-30" />
      <div className="px-4 py-5 font-extrabold z-10">{date}</div>
      <div className="px-4 py-5 z-10">{entry.analysis?.summary}</div>
      <div className="px-4 py-4 z-10">{entry.analysis?.mood}</div>
    </div>
  );
};

export default EntryCard;
