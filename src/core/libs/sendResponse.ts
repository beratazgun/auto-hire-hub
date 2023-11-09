import { Response } from 'express';

interface JsonFieldsInterface<T> {
  statusCode: number;
  message?: string;
  status: string;
  isSuccess: boolean;
  result?: T;
}

function sendResponse<T>(jsonFields: JsonFieldsInterface<T>, res: Response) {
  const { statusCode, message, status, isSuccess, result } = jsonFields;

  res.status(statusCode).json({
    isSuccess,
    statusCode,
    message: message || undefined,
    status,
    result: result || undefined,
  }).statusMessage = message;
}

export { sendResponse };
