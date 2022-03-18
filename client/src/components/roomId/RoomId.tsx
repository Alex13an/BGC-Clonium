import React, { FC, useState } from 'react'
import './roomId.scss'
import copyToClipboard from './../../utils/copyToClipboars'

interface RoomIdProps {
  roomId: string
}

const RoomId: FC<RoomIdProps> = ({ roomId }) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyHandler = () => {
    copyToClipboard()
    if (isCopied) return
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className="room-id">
      <span
        onClick={copyHandler}
        className={isCopied ? 'room-id__header room-id__header_active' : 'room-id__header'}
      >
        {'Room ID: '}
      </span>
      {roomId}
    </div>
  )
}

export default RoomId
