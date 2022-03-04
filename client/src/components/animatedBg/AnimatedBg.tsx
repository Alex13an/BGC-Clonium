import React, { FC } from 'react'
import './animatedBg.scss'

const AnimatedBg: FC = () => {
	return (
		<div className="animation-area">
			<div className="animation-area__box"></div>
			<div className="animation-area__box"></div>
			<div className="animation-area__box"></div>
			<div className="animation-area__box"></div>
			<div className="animation-area__box"></div>
			<div className="animation-area__box"></div>
		</div>
	)
}

export default AnimatedBg