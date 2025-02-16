"use client";

import { useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs";

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Hello {user?.firstName}!</p>
    </div>
  );
}

export function getUser() {
  const { userId } = auth();
  return userId;
}

export function requireAuth() {
  const userId = getUser();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
