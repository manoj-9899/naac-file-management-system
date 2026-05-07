import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      role: "TEACHER" | "HOD";
      profileCompleted: boolean;
      approvalStatus: "PENDING" | "APPROVED";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "TEACHER" | "HOD";
    profileCompleted?: boolean;
    approvalStatus?: "PENDING" | "APPROVED";
    isActive?: boolean;
  }
}

