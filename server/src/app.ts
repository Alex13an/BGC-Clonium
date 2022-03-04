import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import config from 'config'
import logger from './utils/logger'
import sockets from './sockets';

const port = config.get<number>('port')
const host = config.get<string>('host')
const corsOrigin = config.get<string>('corsOrigin')

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
	cors: {
		origin: corsOrigin,
		credentials: true
	}
})

app.get('/', (_, res) => res.send('Server is Up!'))

httpServer.listen(port, host, () => {
	logger.info('Server is listening')
	logger.info(`http://${host}:${port}`)

	sockets({ io })
})