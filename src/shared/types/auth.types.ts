// Path: src/shared/types/auth.types.ts
import { Request } from "express";
import { ApiKey } from "../../drizzle/schema";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "student" | "admin";
  };
  apiKey?: ApiKey;
}
