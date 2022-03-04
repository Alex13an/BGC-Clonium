import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OPlayer } from '../../models/onlineGameTypes';

interface socketState {
	socketId?: string;
	currentRoomId: string;
	currentPlayer: OPlayer;
}

const initialState: socketState = {
	currentRoomId: '',
	currentPlayer: {} as OPlayer,
}

export const socketSlice = createSlice({
	name: 'socket',
	initialState,
	reducers: {
		setGameData: (state, action: PayloadAction<{player: OPlayer, roomId: string}>) => {
			state.currentRoomId = action.payload.roomId
			state.currentPlayer = action.payload.player
		},
		updateGameData: (state, action: PayloadAction<{players: OPlayer[]}>) => {
			const deprPlayer = action.payload.players.find(p => 
				p.isWinning === state.currentPlayer.isWinning &&
				p.playerId === state.currentPlayer.playerId &&
				p.playerName === state.currentPlayer.playerName &&
				p.totalCells === state.currentPlayer.totalCells &&
				p.totalScore === state.currentPlayer.totalScore
			)
			if (!deprPlayer) return
			state.currentPlayer = deprPlayer
		}
	}
})

export const { setGameData, updateGameData } = socketSlice.actions

export default socketSlice.reducer