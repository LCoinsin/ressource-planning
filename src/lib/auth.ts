import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parsePermissions } from "@/lib/permissions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const member = await prisma.member.findUnique({
          where: { email },
          include: { appRole: true },
        });

        if (!member || !member.passwordHash || !member.isActive) return null;

        const isValid = bcryptjs.compareSync(password, member.passwordHash);
        if (!isValid) return null;

        return {
          id: member.id,
          email: member.email!,
          name: `${member.prenom} ${member.nom}`,
          role: member.appRole?.name ?? "Visitor",
          permissions: parsePermissions(member.appRole?.permissions ?? "[]"),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.permissions = (user as { permissions: string[] }).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as { role: string }).role = (token.role as string) ?? "Visitor";
        (session.user as { permissions: string[] }).permissions =
          (token.permissions as string[]) ?? [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
