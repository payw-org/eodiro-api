import { Request, Response, NextFunction } from 'express'

export { Request, Response, NextFunction }
export type SimpleHandler = (req: Request, res: Response) => void
export type NextHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void
export type ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void
export type RequestHandler = SimpleHandler | NextHandler | ErrorHandler
