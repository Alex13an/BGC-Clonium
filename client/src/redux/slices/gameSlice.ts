import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPlayer } from "../../models/gameTypes";

interface GameState {
	players: IPlayer[];
	turn: number;
}

const initialState: GameState = {
	players: [] as IPlayer[],
	turn: 0,
}

export const gameSlice = createSlice({
	name: 'clonium',
	initialState,
	reducers: {
		playersTotalZero: (state) => {
			state.players.map(player => {
				player.totalCells = 0
				player.totalScore = 0
			})
		},
		addPlayer: (state, action: PayloadAction<IPlayer>) => {
			state.players.push(action.payload)
		},
		playerAddTotalScore: (state, action: PayloadAction<{playerId: number, score: number}>) => {
			let {score} = action.payload
			state.players[action.payload.playerId].totalScore += score
		},
		playerAddTotalCells: (state, action: PayloadAction<{playerId: number, score: number}>) => {
			let {score} = action.payload
			state.players[action.payload.playerId].totalCells += score
		},
		playersSetLoosers: (state) => {
			state.players.map(player => {
				const {totalCells, isWinning} = player
				if (totalCells <= 0 && isWinning) {
					const index = state.players.findIndex(p => p.playerId === player.playerId) 
					state.players[index].isWinning = false
				}
			})
		},
		makeTurn: (state) => {
			if (state.players.filter(p => p.isWinning).length > 1) {
				const nextId = state.players.find(p => p.playerId > state.turn && p.isWinning)
				if (!nextId) {
					state.turn = state.players.find(p => p.isWinning)?.playerId || 1
					return
				}
				state.turn = nextId?.playerId || 1
			} else {
				state.turn = -1
			}
		}
	}
})

export const {addPlayer, playersTotalZero, playerAddTotalScore, playerAddTotalCells, playersSetLoosers, makeTurn} = gameSlice.actions

export default gameSlice.reducer