interface Analysis {
  color: string;
  summary: string;
  mood: string;
}

interface Entry {
  createdAt: string;
  analysis: Analysis;
}

interface EntryCardProps {
  entry: Entry;
}

const EntryCard = ({ entry }: EntryCardProps) => {
  const date = new Date(entry.createdAt).toDateString();

  return (
    <div
      className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-700 shadow`}
      // style={{ backgroundColor: entry.analysis.color }}
    >
      <div className="px-4 py-5">{date}</div>

      <div className="px-4 py-5">summary</div>
      <div className="px-4 py-4">mood</div>
    </div>
  );
};

export default EntryCard;
