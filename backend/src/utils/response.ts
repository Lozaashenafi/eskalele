import type { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  object: any = null,
  errors: string[] | null = null,
) => {
  return res.status(statusCode).json({
    Success: statusCode < 400,
    Message: message,
    Object: object,
    Errors: errors,
  });
};

export const sendPaginatedResponse = (
  res: Response,
  message: string,
  data: any[],
  page: number,
  size: number,
  total: number,
) => {
  return res.status(200).json({
    Success: true,
    Message: message,
    Object: data,
    PageNumber: page,
    PageSize: size,
    TotalSize: total,
    Errors: null,
  });
};
