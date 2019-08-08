import server_config from 'Configs/server'
import DBServiceProvider from 'Providers/DBServiceProvider'
import RouteServiceProvider from 'Providers/RouteServiceProvider'

const db_provider = new DBServiceProvider()
const route_provider = new RouteServiceProvider()

db_provider.boot() // boot asynchronously
const app = route_provider.boot()

app.listen(server_config.port)
