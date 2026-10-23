import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
