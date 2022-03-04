import { Server, Socket } from "socket.io";
import logger from "./utils/logger";
import { Clonium } from "./game/clonium";
import { IPlayer } from './models/models';

enum EVENTS {
	connection = 'connection',
	disconnecting = 'disconnecting',
	roomInit = 'roomInit',
	sendRoomId = 'sendRoomId',
	getRooms = 'getRooms',
	listRooms = 'listRooms',
	joinRoom = 'joinRoom',
	checkPlayer = 'checkPlayer',
	setPlayers = 'setPlayers',
	getPlayers = 'getPlayers',
	updatePlayers = 'updatePlayers',
	gameStart = 'gameStart',
	gameInit = 'gameInit',
	gameIncrement = 'gameIncrement',
	getGameData = 'getGameData',
	gameWin = 'gameWin',
}

const Rooms = new Map()

function sockets({ io }: { io: Server}) {
	logger.info(`Sockets enabled`)

	io.on(EVENTS.connection, (socket: Socket) => {
		logger.info(`User connected ${socket.id}`)

		socket.on(EVENTS.roomInit, (roomId: string, username: string, callback) => {
			try {
				socket.join(roomId)
				logger.info(`User ${socket.id} joined ${roomId}`)
				Rooms.set(roomId, new Clonium(username, socket.id))

				const gameRoom: Clonium = Rooms.get(roomId)
				callback({
					status: 'ok',
					player: gameRoom.players.find(p => p.playerId === socket.id && p.playerName === username)
				})
				io.in(roomId).emit(EVENTS.getPlayers, gameRoom.players)
			} catch (e) {
				callback({
					status: `NOT ok ${e}`
				})
			}
		})

		socket.on(EVENTS.joinRoom, (roomId: string, username: string, callback) => {
			const gameRoom: Clonium = Rooms.get(roomId)
			if (!gameRoom) return callback({startError: 'NO ROOM'})
			if (gameRoom.isStarted) return callback({startError: 'Game already started in that room!'})
			if (gameRoom.players.length >= 4) return callback({startError: 'That room is full!'})

			socket.join(roomId)
			logger.info(`User ${socket.id} joined ${roomId}`)
			gameRoom.addPlayer(username, socket.id)
			io.in(roomId).emit(EVENTS.getPlayers, gameRoom.players)
			callback({
				startError: '', 
				player: gameRoom.players.find(p => p.playerId === socket.id && p.playerName === username)
			})
		})

		socket.on(EVENTS.checkPlayer, (roomId: string, callback) => {
			const gameRoom: Clonium = Rooms.get(roomId)
			if (!gameRoom) return callback({legit: false, errText: 'There is no room with that id!'})
			if (!gameRoom.players.find(player => player.playerId === socket.id) && gameRoom.players.length >= 4) return callback({legit: false, errText: 'Room is full'})
			if (!gameRoom.players.find(player => player.playerId === socket.id) && gameRoom.isStarted) return callback({legit: false, errText: 'Game has already started in this room'})
			if (!gameRoom.players.find(player => player.playerId === socket.id)) return callback({legit: false})
			callback({legit: true})
			io.to(socket.id).emit(EVENTS.getPlayers, gameRoom.players)
		})

		socket.on(EVENTS.setPlayers, (roomId: string, callback) => {
			try {
				const gameRoom: Clonium = Rooms.get(roomId)
				callback({
					newPlayers: gameRoom.players
				})
			} catch(error) {
				console.log(error)
			}
		})

		socket.on(EVENTS.gameStart, async (roomId: string) => {
			try {
				const gameRoom: Clonium = Rooms.get(roomId)
				await gameRoom.gameStart()

				io.in(roomId).emit(EVENTS.gameInit, gameRoom.gameGrid, gameRoom.players, gameRoom.turn)
			} catch (err) {
				console.log(err)
			}
		})

		const roomExpansion = (roomId: string) => {
			const gameRoom: Clonium = Rooms.get(roomId)
			if (!gameRoom.isExpanding) return 

			gameRoom.expansion()
			io.in(roomId).emit(EVENTS.getGameData, gameRoom.gameGrid, gameRoom.players, gameRoom.turn, gameRoom.isExpanding)

			if (gameRoom.turn === -1) {
				io.in(roomId).emit(EVENTS.gameWin, gameRoom.winner)
			}

			setTimeout(() => roomExpansion(roomId), 500)
		}

		socket.on(EVENTS.gameIncrement, (roomId: string, i: number, j: number) => {
			const gameRoom: Clonium = Rooms.get(roomId)
			try {
				gameRoom.increment(i, j)
				io.in(roomId).emit(EVENTS.getGameData, gameRoom.gameGrid, gameRoom.players, gameRoom.turn, gameRoom.isExpanding)
				if (gameRoom.turn === -1) {
					return io.in(roomId).emit(EVENTS.gameWin, gameRoom.winner)
				}
				if (gameRoom.gameGrid[i][j].value >= 4) {
					gameRoom.isExpanding = true
					gameRoom.expandableCells += 1
					io.in(roomId).emit(EVENTS.getGameData, gameRoom.gameGrid, gameRoom.players, gameRoom.turn, gameRoom.isExpanding)
					setTimeout(() => roomExpansion(roomId), 500)
				}
			} catch (err) {
				console.log(err)
			}
		})

		socket.on(EVENTS.disconnecting, () => {
			logger.info(`User disconnected ${socket.id}`)
			Rooms.forEach((room: Clonium, roomId: string) => {
				if (room.isStarted) {
					room.defeatPlayer(socket.id) && io.in(roomId).emit(EVENTS.getGameData, room.gameGrid, room.players, room.turn, room.isExpanding)
					if (room.turn === -1) {
						io.in(roomId).emit(EVENTS.gameWin, room.winner)
					}
				} else {
					room.removePlayer(socket.id) && io.in(roomId).emit(EVENTS.updatePlayers, room.players)
				}
			})
		})

	})
}

export default sockets