import { RequestHandler } from 'Http/RequestHandler'

export default interface Middleware {
  handler(): RequestHandler
}
