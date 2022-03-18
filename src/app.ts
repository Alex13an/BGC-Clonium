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

const io = new Server(httpServer, {
	cors: {
		origin: corsOrigin,
		credentials: true
	}
})

app.use(express.static(path.join(path.dirname(path.dirname(__dirname)), 'client/build')));
app.get('*', function(req, res) {
  res.sendFile(path.join(path.dirname(path.dirname(__dirname)), 'client/build', 'index.html'));
});


httpServer.listen(port, () => {
	logger.info('Server is listening')
	logger.info(`${port}`)

	sockets({ io })
})