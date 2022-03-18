import React, { FC, useEffect, useState, Suspense } from 'react'
import './gamePage.scss'
import socket from '../../sockets/socket'
import { useParams, useNavigate } from 'react-router-dom'
import { OCell, OPlayer } from '../../models/onlineGameTypes'
import QuickPlayerInit from './../../components/quickPlayerInit/QuickPlayerInit';
import PlayersList from '../../components/playersList/PlayersList'
import { useAppDispatch } from './../../hooks/storeHooks';
import { updateGameData } from '../../redux/slices/socketSlice'
import RoomId from './../../components/roomId/RoomId';
import Winner from './../../components/winner/Winner';

const GameGrid = React.lazy(() => import('./../../components/gameGrid/GameGrid'))
const GamePlayers = React.lazy(() => import('./../../components/gamePlayers/GamePlayers')) ;

const GamePage: FC = () => {
	const gameParams = useParams()
	const { gameId } = gameParams 
	const navigate = useNavigate()
	const [isJoined, setIsJoined] = useState(false)
	const [players, setPlayers] = useState<OPlayer[]>([])
	const [gameStarted, setGameStarted] = useState(false)
	const [grid, setGrid] = useState<OCell[][]>([])
	const [turn, setTurn] = useState(0)
	const [isExpanding, setIsExpanding] = useState(false)
	const [winner, setWinner] = useState<OPlayer>({} as OPlayer)
	const dispatch = useAppDispatch()

	useEffect(() => {
		socket.emit('checkPlayer', gameId, (res: {legit: boolean, errText:string}) => {
			if(!res.legit) {
				if(res.errText) {
					alert(res.errText)
					navigate('/')
				} 
			} else {
				setIsJoined(true)
			}
		})
	}, [])

	useEffect(() => {
		socket.on('getPlayers', (newPlayers: OPlayer[]) => {
			console.log('Player joined')
			setPlayers(() => [...newPlayers])
		})
		socket.on('updatePlayers', (NewPlayers: OPlayer[]) => {
			dispatch(updateGameData({players: NewPlayers}))
			setPlayers(() => [...NewPlayers])
		})
		socket.on('gameInit', (gameGrid: OCell[][], NewPlayers: OPlayer[], NewTurn: number) => {
			console.log('Game Stared!')
			setGameStarted(true)
			setGrid(() => gameGrid)
			setPlayers(() => [...NewPlayers])
			setTurn(() => NewTurn)
		})
		socket.on('getGameData', (gameGrid: OCell[][], NewPlayers: OPlayer[], NewTurn: number, NewIsExpanding) => {
			setGrid(() => gameGrid)
			setPlayers(() => [...NewPlayers])
			setTurn(() => NewTurn)
			setIsExpanding(() => NewIsExpanding)
		})
		socket.on('gameWin', (winner: OPlayer) => {
			setWinner(winner)
		})
	}, [socket])

	const gameStart = () => {
		if (players.length < 2) return
		socket.emit('gameStart', gameId)
	}

	const cellIncrement = (i: number, j:number) => {
		socket.emit('gameIncrement', gameId, i, j)
	}

	return (
		<>
			{!isJoined ? 
				<QuickPlayerInit addRegPlayer={setIsJoined} roomId={gameId || ''} socket={socket} />
				:
				!gameStarted &&
				<div className="game-preview">
					<PlayersList players={players}/>
					<RoomId roomId={gameId || ''} />
					<button 
						onClick={gameStart} 
						className={players.length > 1 ? 'game-preview__start game-preview__start_active' : 'game-preview__start'}>
						START
					</button>
				</div>
			}
			{gameStarted && <div className='game-wrapper'>
				<Suspense fallback={<div>Loading...</div>}>
					<GamePlayers players={players} turn={turn} />
					<GameGrid grid={grid} turn={turn} isExpanding={isExpanding} increment={cellIncrement}/>
				</Suspense>
				{winner.isWinning && <Winner winner={winner} />}
			</div>}
		</>
	)
}

export default GamePage