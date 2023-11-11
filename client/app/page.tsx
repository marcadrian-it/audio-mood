import Experience from "../components/Experience";
import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  let href = userId ? "/journal" : "/new-user";

  return (
    <div className="flex w-screen h-screen flex-col items-center justify-between p-24 bg-[#150c28]">
      <div className="flex w-[1080px] h-[720px]">
        <Experience />
        <div className="w-1/2 flex flex-col justify-center items-start text-white space-y-4 p-8">
          <h2 className="text-5xl font-semibold">Reflect as Marcus Aurelius</h2>
          <p className="text-2xl">
            Your daily audio mood journal. Track out your thoughts and your
            life.
          </p>
          <Link href={href}>
            <button className="text-lg bg-blue-500 px-3 py-2 rounded-xl">
              start now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
