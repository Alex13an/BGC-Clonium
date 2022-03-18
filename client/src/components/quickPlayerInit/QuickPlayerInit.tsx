import React, { FC, useState } from 'react'
import { Socket } from 'socket.io-client'
import './quickPlayerInit.scss'
import MainForm from './../mainForm/MainForm';
import FormInput from './../formInput/FormInput'
import { useInput } from '../../hooks/inputHooks';
import { useAppDispatch } from './../../hooks/storeHooks';
import { setGameData } from '../../redux/slices/socketSlice';
import { OPlayer } from './../../models/onlineGameTypes';

interface QuickPlayerInitProps {
	roomId: string;
	socket: Socket;
	addRegPlayer: (value: React.SetStateAction<boolean>) => void;
}

const QuickPlayerInit: FC<QuickPlayerInitProps> = ({roomId, socket, addRegPlayer}) => {
	const username = useInput('', {maxLength: 30, minLength: 3})
	const dispatch = useAppDispatch()

	const quickJoin = () => {
		if(!username.value) return

		socket.emit('joinRoom', roomId, username.value, (response: {startError: string, player: OPlayer}) => {
			if (response.startError) return alert(response.startError)
			dispatch(setGameData({player: response.player, roomId}))
		})

		addRegPlayer(prev => !prev)
	}

	return (
		<MainForm>
			<div className="quick-form">
				<FormInput
					label='Username'
					errorText={username.errorText}
					value={username.value}
					changeHandler={username.onChange}
					withButton
					placeholder='Enter your name...'
					buttonLabel='Join'
					clickHandler={quickJoin}
					blurHandler={username.onBlur}
				/>
			</div>
		</MainForm>
	)
}

export default QuickPlayerInit