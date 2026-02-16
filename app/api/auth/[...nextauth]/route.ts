import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export const authOptionsExport = authOptions; // Just in case name collision
export { handler as GET, handler as POST, authOptions };
