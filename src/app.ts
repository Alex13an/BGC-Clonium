import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import config from 'config'
import path from 'path'
import logger from './utils/logger'
import sockets from './sockets';

const port = process.env.PORT || config.get<number>('port')
const host = config.get<string>('host')
const corsOrigin = config.get<string>('corsOrigin')

const app = express()

const httpServer = createServer(app)

const whitelist = ['http://localhost:3000', 'http://localhost:4000', 'https://bgc-clonium-game.herokuapp.com']
const corsOptions = {
  origin: function (origin: any, callback: any) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const io = new Server(httpServer, {
	cors: corsOptions
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(path.basename(__dirname), 'client/build')));
  app.get('*', function(req, res) {
    res.sendFile(path.join(path.basename(__dirname), 'client/build', 'index.html'));
  });
}

httpServer.listen(port, () => {
	logger.info('Server is listening')
	logger.info(`${port}`)

	sockets({ io })
})