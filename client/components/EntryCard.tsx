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

  return (
    <div
      data-testid="entry-card"
      className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-700 shadow`}
      // style={{ backgroundColor: entry.analysis.color }}
    >
      <div className="px-4 py-5">{date}</div>

      <div className="px-4 py-5">{entry.analysis?.summary}</div>
      <div className="px-4 py-4">mood</div>
    </div>
  );
};

export default EntryCard;
