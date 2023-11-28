import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-[#ddd1f4] flex w-screen h-screen flex-col items-center justify-center">
      <SignUp afterSignUpUrl="/new-user" redirectUrl="/new-user" />
    </div>
  );
}
