import server_config from 'Configs/server'
import DBServiceProvider from 'Providers/DBServiceProvider'
import RouteServiceProvider from 'Providers/RouteServiceProvider'
import ScheduleServiceProvider from 'Providers/ScheduleServiceProvider'

const db_provider = new DBServiceProvider()
const schedule_provider = new ScheduleServiceProvider()
const route_provider = new RouteServiceProvider()

// boot all service provider after database is set
db_provider.boot().then(() => {
  schedule_provider.boot()
  const app = route_provider.boot()
  app.listen(server_config.port)
})
