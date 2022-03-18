import React, { FC } from 'react'
import './mainForm.scss'

const MainForm: FC = ({children}) => {
	return (
		<div className='main-form'>
			<div className="main-form__wrapper">
				<h2 className="game-label">Clonium</h2>
				{children}
			</div>
		</div>
	)
}

export default MainForm