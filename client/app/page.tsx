import Experience from "../components/Experience";
import React, { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  let href = userId ? "/journal" : "/new-user";

  return (
    <div className="flex w-screen h-screen flex-col items-center justify-between pt-52 p-24 bg-[#150c28]">
      <div className="flex w-[1080px] h-[720px] shadow-glow">
        <Experience />
        <div className="w-1/2 flex flex-col justify-center items-start text-white space-y-4 p-8">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-500">
            Reflect as Marcus Aurelius
          </h2>
          <p className="text-2xl">
            Your daily audio mood journal. Track out your thoughts and your
            life.
          </p>
          <Link href={href}>
            <button className="text-lg bg-blue-500 px-3 py-2 rounded-xl hover:scale-105 hover:bg-blue-600 hover:shadow-lg transition duration-300 ease-in-out transform">
              start now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
