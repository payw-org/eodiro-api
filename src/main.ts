import dotenv from 'dotenv'
import DBServiceProvider from 'Providers/DBServiceProvider'
import RouteServiceProvider from 'Providers/RouteServiceProvider'
import ScheduleServiceProvider from 'Providers/ScheduleServiceProvider'

/**
 * Boot eodiro api app.
 */
async function bootApp(): Promise<void> {
  const dbProvider = new DBServiceProvider()
  const scheduleProvider = new ScheduleServiceProvider()
  const routeProvider = new RouteServiceProvider()

  // boot all service provider after database is set
  await dbProvider.boot()
  scheduleProvider.boot()
  const app = routeProvider.boot()
  app.listen(process.env.APP_PORT)
}

dotenv.config()
bootApp().then()
