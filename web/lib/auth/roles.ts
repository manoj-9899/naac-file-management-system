export const USER_ROLES = ["TEACHER", "HOD"] as const;
export type UserRole = (typeof USER_ROLES)[number];

