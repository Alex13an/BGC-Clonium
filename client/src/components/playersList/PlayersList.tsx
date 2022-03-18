import React, { FC } from 'react'
import './playersList.scss'
import { OPlayer } from './../../models/onlineGameTypes';

interface PlayersListProps {
	players: OPlayer[];
}

const PlayersList: FC<PlayersListProps> = ({players}) => {

	const getPlayersList = () => {
		const filledPlayers = players.map(player => ({
			id: player.id,
			name: player.playerName,
			joined: true,
		})) 
		if (filledPlayers.length < 4) {
			for (let i = filledPlayers.length + 1; i < 5; i++) {
				filledPlayers.push({
					id: i,
					name: `Player ${i}`,
					joined: false,
				})
			}
		}
		return filledPlayers
	}

	return (
		<div className='players-list'>
			<h3 className='players-list__label'>Players</h3>
			<div className="players-list__wrapper">
				{getPlayersList().map((player, index) => 
					<div key={index} className={player.joined ? 'players-list__container' : 'players-list__container players-list__container_empty'}>
						{player.name}
						<span className={`players-list__current players-list__current_${player.id}`}>{player.id}</span>
					</div>	
				)}
			</div>
		</div>
	)
}

export default PlayersList