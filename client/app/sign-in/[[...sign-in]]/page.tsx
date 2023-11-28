import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="bg-[#ddd1f4] flex w-screen h-screen flex-col items-center justify-center">
      <SignIn />
    </div>
  );
}
