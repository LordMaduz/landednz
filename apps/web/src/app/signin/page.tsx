import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { PublicFooter } from "@/components/chrome/public-footer";
import { PublicHeader } from "@/components/chrome/public-header";
import { ANSWERS_COOKIE, decodeAnswers } from "@/lib/answers";
import { SignIn } from "./sign-in-form";

// Google's sign-in button must be Roboto 500; self-hosted because next/font/google flakes in CI (next.js issue 99114)
const roboto = localFont({ src: "./fonts/roboto-500-latin.woff2", weight: "500", variable: "--font-roboto" });

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
