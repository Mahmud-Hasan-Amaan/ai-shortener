import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function getOrCreateUser() {
  await dbConnect();
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  let dbUser = await User.findOne({ clerkId: userId });

  if (!dbUser) {
    dbUser = await User.create({
      clerkId: userId,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });
  }

  return dbUser;
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
