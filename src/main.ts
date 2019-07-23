import express from 'express'
import cors from 'cors'
import server_config from 'Configs/server'
import DBServiceProvider from 'Providers/DBServiceProvider'
import APIServiceProvider from 'Providers/APIServiceProvider'

const db_provider = new DBServiceProvider()
const api_provider = new APIServiceProvider()

db_provider.boot() // asynchronous
const api_service = api_provider.boot()

const app = express()
app.use(cors())
app.use(api_service)

app.listen(server_config.port)
