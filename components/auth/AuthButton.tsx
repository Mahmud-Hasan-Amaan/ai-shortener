"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export function AuthButton() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white">
          Sign In
        </button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span>Welcome, {user.firstName}</span>
      <SignOutButton>
        <button className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white">
          Sign Out
        </button>
      </SignOutButton>
    </div>
  );
}
