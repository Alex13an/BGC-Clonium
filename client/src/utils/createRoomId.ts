import { v4 } from 'uuid'

export const getRoomId = () => {
	const roomId = v4()
	return roomId
}
