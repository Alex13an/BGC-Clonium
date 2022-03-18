import { IPlayer, ICell, DeadCell } from '../models/models';
import produce from 'immer'
import { shuffleArray } from './../utils/arrayShuffle';

export class Clonium {
	private _players: IPlayer[] = []
	private _isStarted: boolean = false
	private _grid: ICell[][] = []
	private _turn: number = 0
	private _isExpanding: boolean = false
	private _expandableCells: number = 0
	private numCols = 7
	private numRows = 7
	private hCap = 4
	private lCap = this.hCap - 1 
	private gridCorners = [
		[1, 1],
		[1, this.numCols - 2],
		[this.numRows - 2, 1],
		[this.numRows - 2, this.numCols - 2],
	]
	private plusCells = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	]

	constructor(playerName: string, socketId: string) {
		this.addPlayer(playerName, socketId)
	}

	public addPlayer(username: string, socketId: string) {
		const len = this._players.length
		if (len < 4) this._players.push({
			id: len + 1, 
			playerId: socketId, 
			playerName: username, 
			totalCells: 0, 
			totalScore: 0, 
			isWinning: true
		})
	}

	public removePlayer(socketId: string): boolean {
		const leaver = this._players.find(p => p.playerId === socketId)
		if (leaver) {
			const {playerName, id} = leaver
			this._players = this._players.filter(player => player.playerId !== socketId)
			this._players.forEach((player, index) => {
				player.id = index + 1
			})
			return true
		}
		return false
	}

	public defeatPlayer(socketId: string) {
		const leaver = this._players.findIndex(p => p.playerId === socketId)
		if (this._players[leaver]) {
			this._players[leaver].isWinning = false
			if (this._players[leaver].id === this._turn) {
				this.makeTurn()
			}
			return true
		} 
		return false
	}

	public async gameStart() {
		this._isStarted = true
		this._grid = Array.from(Array(this.numRows), () => Array<ICell>(this.numCols).fill({value: 0, ownerId: 0, disabled: false}))
		shuffleArray(this.gridCorners)
		for (let i = 0; i < this._players.length; i++) {
			if (this._players[i]) {
				this.addCells(this._players[i].id, 1)
				this.addScore(this._players[i].id, 3)
				this._grid = produce(this._grid, gridCopy => {
					const [x, y] = this.gridCorners[i]
					gridCopy[x][y].value = 3
					gridCopy[x][y].ownerId = i + 1
				})
			}
		}
		this.makeTurn()
	}

	public makeTurn() {
		if (this._players.length > 1 && this._players.filter(p => p.isWinning).length > 1) {
			const nextId = this._players.find(p => p.id > this._turn && p.isWinning)
			if (!nextId) {
				return this._turn = this._players.find(p => p.isWinning)?.id || 1
			}
			this._turn = nextId?.id || 1
		} else {
			this._turn = -1
		}
	}

	private addScore(id: number, score: number) {
		const index = this._players.findIndex(p => p.id === id)
		this._players[index].totalScore += score
	}

	private addCells(id: number, score: number) {
		const index = this._players.findIndex(p => p.id === id)
		this._players[index].totalCells += score
	}

	public setLoosers() {
		for (let i = 0; i < this._players.length; i++) {
			if (!this._players[i]) return console.log(`Player ${i + 1} is missing!`)
			const {totalCells, totalScore} = this._players[i]
			if (totalCells <= 0 || totalScore <= 0) this._players[i].isWinning = false
		}
	}

	public increment(i: number, j: number) {
		this._grid = produce(this._grid, gridCopy => {
			gridCopy[i][j].value += 1
		})
		this.addScore(this._grid[i][j].ownerId, 1)
		if (this._grid[i][j].value < 4) this.makeTurn()
	}

	public expansion() {
		this._grid = produce(this._grid, gridCopy => {
			const deadCells: DeadCell[] = []
			for (let i = 0; i < this.numRows; i++) {
				for (let j = 0; j < this.numCols; j++) {
					if (gridCopy[i][j].value > this.lCap && !deadCells.find(cell => cell.x === i && cell.y === j)) {
						this.addScore(gridCopy[i][j].ownerId, -gridCopy[i][j].value)
						this.addCells(gridCopy[i][j].ownerId, -1)
						gridCopy[i][j].value = 0
						this._expandableCells -= 1
						this.plusCells.forEach(([x, y]) => {
							const newI = i + x
							const newJ = j + y
							if (newI >= 0 && newI < this.numRows && newJ >= 0 && newJ < this.numCols && !this._grid[newI][newJ].disabled) {
								if (gridCopy[newI][newJ].value && gridCopy[newI][newJ].ownerId) {
									this.addScore(gridCopy[newI][newJ].ownerId, -gridCopy[newI][newJ].value)
									this.addCells(gridCopy[newI][newJ].ownerId, -1)
								}
								gridCopy[newI][newJ].value += 1
								gridCopy[newI][newJ].ownerId = gridCopy[i][j].ownerId
								this.addScore(gridCopy[i][j].ownerId, gridCopy[newI][newJ].value)
								this.addCells(gridCopy[i][j].ownerId, 1)
								deadCells.push({x: newI, y: newJ})
								if (gridCopy[newI][newJ].value > this.lCap && gridCopy[newI][newJ].value < this.hCap + 1) {
									this._expandableCells += 1
								}
							}
						})
						gridCopy[i][j].ownerId = 0
					}
				}
			}
		})

		if (this._expandableCells <= 0) {
			this._isExpanding = false
			this._expandableCells = 0
			this.setLoosers()
			this.makeTurn()
		}
	}

	get players() {
		return this._players
	}

	get isStarted() {
		return this._isStarted
	}

	get gameGrid() {
		return this._grid
	}

	get turn() {
		return this._turn
	}

	get isExpanding() {
		return this._isExpanding
	}

	get expandableCells() {
		return this._expandableCells
	}

	get winner() {
		return this._players.find(p => p.isWinning)
	}

	set expandableCells(amount: number) {
		this._expandableCells = amount
	}

	set isExpanding(expanding: boolean) {
		this._isExpanding = true
	}
}

