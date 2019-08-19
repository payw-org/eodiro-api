import dotenv from 'dotenv'
import serverConfig from 'Configs/server'
import DBServiceProvider from 'Providers/DBServiceProvider'
import RouteServiceProvider from 'Providers/RouteServiceProvider'
import ScheduleServiceProvider from 'Providers/ScheduleServiceProvider'

dotenv.config()

const dbProvider = new DBServiceProvider()
const scheduleProvider = new ScheduleServiceProvider()
const routeProvider = new RouteServiceProvider()

// boot all service provider after database is set
dbProvider.boot().then(() => {
  scheduleProvider.boot()
  const app = routeProvider.boot()
  app.listen(serverConfig.port)
})
