import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { PublicFooter } from "@/components/chrome/public-footer";
import { PublicHeader } from "@/components/chrome/public-header";
import { ANSWERS_COOKIE, decodeAnswers } from "@/lib/answers";
import { SignIn } from "./sign-in-form";

// Google's sign-in button must be Roboto 500
const roboto = Roboto({ subsets: ["latin"], weight: "500", variable: "--font-roboto" });

export const metadata: Metadata = { title: "Sign in" };

async function Body() {
  await connection(); // decodeAnswers reads the clock
  const answers = decodeAnswers((await cookies()).get(ANSWERS_COOKIE)?.value);
  return <SignIn answers={answers} />;
}

export default function SignInPage() {
  return (
    <div className={`${roboto.variable} flex min-h-dvh flex-col`}>
      <PublicHeader />
      <Suspense>
        <Body />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
