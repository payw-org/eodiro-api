import { SimpleHandler, Response } from 'Http/RequestHandler'
import { checkSchema, ValidationChain } from 'express-validator'
import Mailer from 'Helpers/Mailer'
import nanoid from 'nanoid'

export default class InquiriesController {
  /**
   * Validate `create` request.
   */
  public static validateCreate(): ValidationChain[] {
    return checkSchema({
      text: {
        exists: true,
        in: 'body',
        isString: true,
        isLength: { options: { min: 2, max: 500 } },
        trim: true,
        escape: true,
        errorMessage: '`text` must be 2 - 500 length string.'
      }
    })
  }

  /**
   * Create a new inquiry.
   * Send inquiry to eodiro mailbox.
   */
  public static create(): SimpleHandler {
    return (req, res): Response => {
      // send mail
      Mailer.sendMail({
        from: '"어디로" <contact@payw.org>',
        to: 'contact@payw.org',
        subject: '어디로 문의 [' + req.params.vendor + '] - ' + nanoid(10),
        text: req.body.text
      })

      return res.status(204).json({})
    }
  }
}
