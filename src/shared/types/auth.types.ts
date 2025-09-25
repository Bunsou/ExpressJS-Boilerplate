// Path: src/shared/types/auth.types.ts
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "student" | "admin";
  };
}
