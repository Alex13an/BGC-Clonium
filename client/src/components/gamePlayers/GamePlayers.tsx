import React, { FC } from 'react'
import './gamePlayers.scss'
import { OPlayer } from './../../models/onlineGameTypes';
import { useAppSelector } from '../../hooks/storeHooks';

interface GamePlayersProps {
	players: OPlayer[];
	turn: number;
}

const GamePlayers: FC<GamePlayersProps> = ({players, turn}) => {
	const {id: currentId} = useAppSelector(state => state.rootReducer.socketSlice.currentPlayer)
	return (
		<div className='game-players'>
			{players.map(player => 
				<div key={player.id} className={
					`${player.id === turn ? 
					'game-players__container game-players__container_active' 
					: 
					'game-players__container'} ${
					!player.isWinning && 'game-players__container_defeat'
					}`
				}>
					<h4 className={currentId === player.id ? 'game-players__name game-players__name_active' : 'game-players__name'}>{player.playerName}</h4>
					<ul className="players-score">
						<li className="players-score__data">Cells: {player.totalCells}</li>
						<li className="players-score__data">Score: {player.totalScore}</li>
					</ul>
				</div>	
			)}
		</div>
	)
}

export default GamePlayers