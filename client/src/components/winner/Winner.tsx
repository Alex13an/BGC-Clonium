import React, { FC } from 'react'
import './winner.scss'
import { OPlayer } from './../../models/onlineGameTypes';

interface WinnerProps {
	winner: OPlayer;
}

const motivation = [
	'They are so cool!',
	"That was amazing!",
	'No way!',
	'They was so good!',
	'Holy cow!',
	'Лучший!',
	'Roses are red, violets are blue, you are the winner, and I love you!',
]

const Winner: FC<WinnerProps> = ({winner}) => {
	return (
		<div className='winner'>
			<div className="winner__wrapper">
				<div className="winner__header">{winner.playerName} WIN!</div>
				<div className="winner__desc">{motivation[Math.floor(Math.random() * motivation.length)]}</div>
			</div>
		</div>
	)
}

export default Winner