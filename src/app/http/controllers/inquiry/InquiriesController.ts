import { SimpleHandler, Response } from 'Http/RequestHandler'
import {
  checkSchema,
  ValidationChain,
  validationResult
} from 'express-validator'
import Mailer from 'Helpers/Mailer'
import University from 'Database/models/university'
import { UniversityDoc } from 'Database/schemas/university'
import uniqid from 'uniqid'

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
        errorMessage: 'Text must be 2 - 500 length string.'
      }
    })
  }

  /**
   * Create a new inquiry.
   * Send inquiry to eodiro mailbox.
   */
  public static create(): SimpleHandler {
    return (req, res): Response => {
      // Handle validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json({ errors: errors.array({ onlyFirstError: true }) })
      }

      // send mail
      Mailer.sendMail({
        from: '"어디로" <contact@payw.org>',
        to: 'contact@payw.org',
        subject:
          '어디로 문의 [' + req.params.vendor + '] - ' + uniqid.process(),
        text: req.body.text
      })

      return res.status(204).json({})
    }
  }
}
