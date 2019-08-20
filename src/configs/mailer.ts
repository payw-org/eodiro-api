const config = {
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD
}

export default config
