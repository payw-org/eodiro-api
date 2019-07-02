import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import expressSession from 'express-session'
import server_config from 'Configs/server'
import DBServiceProvider from 'Provider/DBServiceProvider'
import APIServiceProvider from 'Provider/APIServiceProvider'
const vhost = require('vhost')

const db_provider = new DBServiceProvider()
const api_provider = new APIServiceProvider()

db_provider.boot() // asynchronous
const api_service = api_provider.boot()

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(
  expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
  })
)
app.use(vhost('api.' + server_config.base_uri, api_service))

app.listen(server_config.port)
