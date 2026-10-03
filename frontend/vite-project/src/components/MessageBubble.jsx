export default function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender === currentUserId
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`chat ${isMine ? 'chat-end' : 'chat-start'}`}>
      <div className={`chat-bubble ${isMine ? 'chat-bubble-primary' : ''} max-w-[75%]`}>
        {msg.imageUrl && (
          <img
            src={msg.imageUrl}
            alt="attachment"
            className="max-w-xs rounded-lg mb-1 cursor-pointer"
            onClick={() => window.open(msg.imageUrl, '_blank')}
          />
        )}
        {msg.text && <p className="break-words">{msg.text}</p>}
        <p className={`text-xs mt-1 ${isMine ? 'text-primary-content/60' : 'text-base-content/40'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
