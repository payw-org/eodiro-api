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
export type Handler = SimpleHandler | NextHandler | ErrorHandler

export default interface Middleware {
  handler(): Handler
}
