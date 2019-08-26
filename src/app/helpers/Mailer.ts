import nodeMailer, { Transporter } from 'nodemailer'
import LogHelper from 'Helpers/LogHelper'

export default class Mailer {
  /**
   * Mail transporter
   */
  private static transporter: Transporter = nodeMailer.createTransport({
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  })

  public static sendMail(mailOptions: object): void {
    this.transporter.sendMail(mailOptions, err => {
      if (err) {
        LogHelper.log('error', 'Mailer error: ' + err.stack)
      }
    })
  }
}
