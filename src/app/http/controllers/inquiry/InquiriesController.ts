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
      },
      email: {
        optional: true,
        in: 'body',
        isEmail: true,
        trim: true,
        errorMessage: '`email` must be follow email format.'
      }
    })
  }

  /**
   * Create a new inquiry.
   * Send inquiry to eodiro mailbox.
   */
  public static create(): SimpleHandler {
    return (req, res): Response => {
      let mailText = req.body.text

      if (req.body.email) {
        mailText += '\n\n답변주소: ' + req.body.email
      } else {
        mailText += '\n\n답변주소 미지정'
      }

      // send mail
      Mailer.sendMail({
        from: '"어디로" <contact@payw.org>',
        to: 'contact@payw.org',
        subject: '어디로 문의 [' + req.params.vendor + '] - ' + nanoid(10),
        text: mailText
      })

      return res.status(204).json({})
    }
  }
}
