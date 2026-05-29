import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const DEMO_USERS = [
  { id: "1", email: "dr.garcia@hospital.com", name: "Dr. García", password: "password123" },
  { id: "2", email: "dr.martinez@hospital.com", name: "Dr. Martínez", password: "password123" },
  { id: "3", email: "dr.lopez@hospital.com", name: "Dr. López", password: "password123" },
  { id: "4", email: "dr.rodriguez@hospital.com", name: "Dr. Rodríguez", password: "password123" },
  { id: "5", email: "dr.fernandez@hospital.com", name: "Dr. Fernández", password: "password123" },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = DEMO_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.email = user.email; token.name = user.name; }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = { email: token.email as string, name: token.name as string };
      }
      return session;
    },
  },
};
