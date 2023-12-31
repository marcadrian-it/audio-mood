"use client";

import { createNewEntry } from "@/utils/api";
import { useRouter } from "next/navigation";

const NewEntryCard = () => {
  const router = useRouter();
  const handleOnClick = async () => {
    const data = await createNewEntry();
    router.push(`/journal/${data.data.id}`);
    router.refresh();
  };
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg bg-zinc-200 hover:bg-[#98989a] ease-in-out duration-300"
      onClick={handleOnClick}
    >
      <div className="px-4 py-5 sm:p-6">
        <span className="text-3xl text-black">New Entry</span>
      </div>
    </div>
  );
};

export default NewEntryCard;
