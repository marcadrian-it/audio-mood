"use client";
import { updateEntry } from "@/utils/api";
import { useState } from "react";
import { useAutosave } from "react-autosave";
import Spinner from "./Spinner";
import Recorder from "./Recorder";

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

interface Entry {
  id: string;
  content: string;
  analysis?: Analysis | null;
}

interface EditorProps {
  entry: Entry;
}

const Editor = ({ entry }: EditorProps) => {
  const [text, setText] = useState(entry.content);
  const [currentEntry, setEntry] = useState(entry);
  const [isSaving, setIsSaving] = useState(false);

  let colorArray = ["#ffffff", "#ffffff"];
  if (currentEntry?.analysis?.color) {
    colorArray = JSON.parse(currentEntry.analysis.color);
  }
  const gradient = `radial-gradient(circle, ${colorArray[0]}, ${colorArray[1]},white)`;

  useAutosave({
    data: text,
    onSave: async (_text: string) => {
      if (_text === entry.content) return;
      setIsSaving(true);

      const { data, analysis } = await updateEntry(entry.id, _text);
      if (analysis) {
        data.analysis = analysis;
      }

      setEntry(data);
      setIsSaving(false);
    },
  });

  return (
    <div className="w-full h-full grid grid-cols-3 gap-0 relative">
      <div className="absolute left-0 top-0 p-2">
        {isSaving ? (
          <Spinner />
        ) : (
          <div className="w-[16px] h-[16px] rounded-full bg-green-500"></div>
        )}
      </div>
      <div className="col-span-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-full text-4xl p-8 font-extrabold text-black"
        />
      </div>
      <div className="border-l border-black/5">
        <div
          style={{ background: gradient }}
          className="h-[100px] bg-blue-600 text-white p-8"
        >
          <h2 className="text-2xl bg-white/25 text-black">Analysis</h2>
        </div>
        <div>
          <ul role="list" className="divide-y divide-gray-200">
            <li className="py-4 px-8 flex items-center justify-between">
              <div className="text-xl font-semibold w-1/3">Subject</div>
              <div className="text-xl">{currentEntry?.analysis?.subject}</div>
            </li>

            <li className="py-4 px-8 flex items-center justify-between">
              <div className="text-xl font-semibold">Summary</div>
              <div className="text-xl">{currentEntry?.analysis?.summary}</div>
            </li>

            <li className="py-4 px-8 flex items-center justify-between">
              <div className="text-xl font-semibold">Mood</div>
              <div className="text-xl">{currentEntry?.analysis?.mood}</div>
            </li>

            <li className="py-4 px-8 flex items-center justify-between">
              <div className="text-xl font-semibold">Sentiment Score</div>
              <div className="text-xl">
                {currentEntry?.analysis?.sentimentScore}
              </div>
            </li>

            <li className="py-4 px-8 flex items-center justify-between">
              <div className="text-xl font-semibold">Negative</div>
              <div className="text-xl">
                {currentEntry?.analysis?.negative ? "True" : "False"}
              </div>
            </li>
            <li className="py-4 px-8 flex items-center justify-between">
              <Recorder setText={setText} />
            </li>

            <li className="py-4 px-8 flex items-center justify-between">
              <button
                type="button"
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Editor;
