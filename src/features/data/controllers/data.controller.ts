import { Request, Response } from "express";
import { sendSuccessResponse } from "../../../shared/utils/responseHandler";

export const getPublicData = (req: Request, res: Response) => {
  sendSuccessResponse(
    res,
    { content: "This is public data, accessible with a general key." },
    "Public data retrieved"
  );
};

export const getSensitiveData = (req: Request, res: Response) => {
  sendSuccessResponse(
    res,
    { content: "This is sensitive data, requiring special read permission." },
    "Sensitive data retrieved"
  );
};
