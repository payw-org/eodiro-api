require('dotenv').config()

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME,
      script: './build/eodiro.api.built.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: true,
      max_memory_restart: '1G'
    }
  ]
}
