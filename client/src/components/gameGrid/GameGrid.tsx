import React, { FC } from 'react'
import { useAppSelector } from '../../hooks/storeHooks'
import { OCell } from '../../models/onlineGameTypes'
import './gameGrid.scss'

interface GameGridProps {
	grid: OCell[][];
	turn: number;
	isExpanding: boolean;
	increment: (i: number, j: number) => void;
}

const GameGrid: FC<GameGridProps> = ({grid, turn, isExpanding, increment}) => {
	const currentId = useAppSelector(state => state.rootReducer.socketSlice.currentPlayer).id
	return (
	<div style={{
			display: 'grid',
			gridTemplateColumns: `repeat(${grid.length}, 52px)`
		}}
		className='game-block'
	>
		{
			grid.map((rows, i) => 
				rows.map((col, j) => 
					<div 
						className={
							`${turn > 0 && grid[i][j].ownerId === turn && !isExpanding ? 
							'game-block__cell game-block__cell_active' 
							:
							'game-block__cell'} ${
								currentId === turn && grid[i][j].ownerId === turn && !isExpanding ? 'game-block__cell_clickable' : ''
							}`
						} 
						key={`${i}-${j}`}
						onClick={currentId === turn && grid[i][j].ownerId === turn && !isExpanding ? () => increment(i, j) : undefined}
					>
						<span className={`game-block__data player-${grid[i][j].ownerId}`}>
							{grid[i][j].value ? grid[i][j].value : undefined}
						</span>
					</div>
				)	
			)
		}
	</div>
	)
}

export default GameGrid