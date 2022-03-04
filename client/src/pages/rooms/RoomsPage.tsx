import React, { FC } from 'react'
import './roomsPage.scss'
import { Link, useNavigate } from 'react-router-dom'
import socket from '../../sockets/socket'
import { getRoomId } from '../../utils/createRoomId'
import { useInput } from './../../hooks/inputHooks';
import MainForm from './../../components/mainForm/MainForm';
import FormInput from '../../components/formInput/FormInput'
import { useAppDispatch } from '../../hooks/storeHooks'
import { setGameData } from '../../redux/slices/socketSlice'
import { OPlayer } from '../../models/onlineGameTypes'
import AnimatedBg from './../../components/animatedBg/AnimatedBg';

const RoomsPage: FC = () => {
	const username = useInput('', {minLength: 3, maxLength: 30})
	const roomId = useInput('', {isEmpty: true})
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const roomInitHandle = () => {
		if (!socket || !username.value) return

		const room = getRoomId()
		socket.emit('roomInit', room, username.value, (res: {status: string, player: OPlayer}) => {
			if (res.status !== 'ok') return console.log(res.status)
			dispatch(setGameData({player: res.player, roomId: room}))
			navigate(`/game/${room}`)
		})
	}

	const joinRoomHandle = () => {
		if(!roomId.value || !username.value) return

		socket.emit('joinRoom', roomId.value, username.value, (response: {startError: string, player: OPlayer}) => {
			if (response.startError) return alert(response.startError)
			dispatch(setGameData({player: response.player, roomId: roomId.value}))
			navigate(`/game/${roomId.value}`)
		})
	}

	const buttonDirtyClick = () => {
		roomId.dirtyClick()
		username.dirtyClick()
		joinRoomHandle()
	}

	return (
		<MainForm>
			<div className='start-form'>
				<FormInput 
					label='Username'
					errorText={username.errorText}
					placeholder='Your name...'
					value={username.value}
					changeHandler={username.onChange}
					blurHandler={username.onBlur}
				/>

				<FormInput 
					label='Direct Connection'
					errorText={roomId.errorText}
					placeholder='Room ID...'
					value={roomId.value}
					changeHandler={roomId.onChange}
					withButton
					buttonLabel='Connect'
					clickHandler={buttonDirtyClick}
				/>

				<div className="start-form__bottom-buttons">
					<button 
						className='start-form__create-room'
						onClick={() => {
							username.dirtyClick()
							roomInitHandle()
						}}
					>
						Create new room
					</button>
					<Link to={'/game'}><button className='start-form__singleplayer'>Singleplayer</button></Link>
				</div>
			</div>
			<AnimatedBg />
		</MainForm>
	)
}

export default RoomsPage