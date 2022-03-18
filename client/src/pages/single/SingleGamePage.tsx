import React, { FC, useCallback, useState, useRef } from 'react'
import produce from 'immer'
import { ICell, IExpansion } from '../../models/gameTypes'
import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks'
import { addPlayer, playerAddTotalScore, playerAddTotalCells, playersSetLoosers, makeTurn } from '../../redux/slices/gameSlice'
import './singleGamePage.scss'

const numRows = 7
const numCols = 7
const hCap = 4
const lCap = hCap - 1 

const plusCells = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
]

const gridCorners = [
	[1, 1],
	[1, numCols - 2],
	[numRows - 2, 1],
	[numRows - 2, numCols - 2]
]

interface DeadCell {
	x: number;
	y: number;
}

const SingleGamePage: FC = () => {
	const [grid, setGrid] = useState(() => Array.from(Array(numRows), () => Array<ICell>(numCols).fill({value: 0, ownerId: 0, disabled: false})))
	const [expanding, setExpanding] = useState<IExpansion>({isExpanding: false, expandableCells: 0})
	const players = useAppSelector(state => state.rootReducer.gameSlice.players)
	const turn = useAppSelector(state => state.rootReducer.gameSlice.turn)
	const dispatch = useAppDispatch()

	const expandingRef = useRef(expanding)
	expandingRef.current = expanding

	const startExpansion = useCallback(() => {
		if (!expandingRef.current.isExpanding) {
			return
		}

		console.log('EXPANDED!')
		setGrid(g => {
			return produce(g, gridCopy => {
				const deadCells: DeadCell[] = []
				for (let i = 0; i < numRows; i++) {
					for (let j = 0; j < numCols; j++) {
						if (gridCopy[i][j].value > lCap && !deadCells.find(cell => cell.x === i && cell.y === j)) {
							dispatch(playerAddTotalScore({playerId: gridCopy[i][j].ownerId - 1, score: -gridCopy[i][j].value}))
							dispatch(playerAddTotalCells({playerId: gridCopy[i][j].ownerId - 1, score: -1}))
							gridCopy[i][j].value = 0
							expandingRef.current.expandableCells -= 1
							plusCells.forEach(([x, y]) => {
								const newI = i + x
								const newJ = j + y
								if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols && !g[newI][newJ].disabled) {
									if (gridCopy[newI][newJ].value && gridCopy[newI][newJ].ownerId) {
										dispatch(playerAddTotalScore({playerId: gridCopy[newI][newJ].ownerId - 1, score: -gridCopy[newI][newJ].value}))
										dispatch(playerAddTotalCells({playerId: gridCopy[newI][newJ].ownerId - 1, score: -1}))
									}
									gridCopy[newI][newJ].value += 1
									gridCopy[newI][newJ].ownerId = gridCopy[i][j].ownerId
									dispatch(playerAddTotalScore({playerId: gridCopy[i][j].ownerId - 1, score: gridCopy[newI][newJ].value}))
									dispatch(playerAddTotalCells({playerId: gridCopy[i][j].ownerId - 1, score: 1}))
									deadCells.push({x: newI, y: newJ})
									if (gridCopy[newI][newJ].value > lCap && gridCopy[newI][newJ].value < hCap + 1) {
										expandingRef.current.expandableCells += 1
									}
								}
							})
							gridCopy[i][j].ownerId = 0
						}
					}
				}
			})
		})

		if (expandingRef.current.expandableCells <= 0) {
			setExpanding({isExpanding: false, expandableCells: 0})
			dispatch(playersSetLoosers())
			dispatch(makeTurn())
			return
		}
		
		setTimeout(startExpansion, 1000)
	}, [])

	const cellIncrement = (i: number, j: number) => {
		const {value, ownerId} = grid[i][j]
		if (!expanding.isExpanding && value && ownerId === turn && turn > 0) {
			if (value >= lCap) {
				if (!expanding.isExpanding) {
					expandingRef.current.isExpanding = true
					expandingRef.current.expandableCells += 1
					startExpansion()
				}
			} else {
				dispatch(makeTurn())
			}
			const newGrid = produce(grid, gridCopy => {
				gridCopy[i][j].value += 1
			})
			setGrid(newGrid)
			dispatch(playerAddTotalScore({playerId: ownerId - 1, score: 1}))
		}
	}

	const gameStart = () => {
		const totalPlayers = 4
		for (let i = 0; i < totalPlayers; i++) {
			dispatch(addPlayer({
				playerId: i + 1,
				isWinning: true,
				totalCells: 1,
				totalScore: 1
			}))
			setGrid(g => {
				return produce(g, gridCopy => {
					const [x, y] = gridCorners[i]
					gridCopy[x][y].value = 1
					gridCopy[x][y].ownerId = i + 1
				})
			})
		}
		dispatch(makeTurn())
	}

	return (
	<>
	<div className="info-panel">
		{players.map(player =>
			<div className="info-panel__item" key={player.playerId}>
				<h3 className='info-panel__heading'>{`Player ${player.playerId}`}</h3>
				<span className='info-panel__score'>{`Total cells: ${player.totalCells}`}</span>
				<span className='info-panel__score'>{`Total score: ${player.totalScore}`}</span>
				{turn === player.playerId && 
					<span>TURN</span>
				}
			</div>	
		)}
	</div>
	<div className='solo-game-wrapper'>
		<button onClick={gameStart}>START</button>
		<div className='debug'>
			{expanding.isExpanding && <h2>EXPANDING</h2>}
		</div>
		<div style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${numCols}, 52px)`
			}}
			className='solo-game-block'
		>
			{
				grid.map((rows, i) => 
					rows.map((col, j) => 
						<div 
							className={turn > 0 && grid[i][j].ownerId === turn && !expanding.isExpanding ? 'solo-game-block__cell solo-game-block__cell_active' : 'solo-game-block__cell'} 
							key={`${i}-${j}`}
							onClick={() => cellIncrement(i, j)}
						>
							<span className={`solo-game-block__data player-${grid[i][j].ownerId}`}>
								{grid[i][j].value ? grid[i][j].value : undefined}
							</span>
						</div>
					)	
				)
			}
		</div>
	</div>
	</>
	)
}

export default SingleGamePage