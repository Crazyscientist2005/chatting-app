export default function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender === currentUserId
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (only for received messages) */}
      {!isMine && (
        <div
          className="rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
          style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
            alignSelf: 'flex-end',
            marginBottom: '2px',
          }}
        >
          U
        </div>
      )}

      <div
        className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
        style={{ maxWidth: '65%' }}
      >
        {msg.imageUrl && (
          <div
            className="rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => window.open(msg.imageUrl, '_blank')}
            style={{
              background: isMine ? '#5b21b6' : '#252638',
              padding: '6px',
            }}
          >
            <img
              src={msg.imageUrl}
              alt="attachment"
              className="rounded-xl"
              style={{ maxWidth: '220px', maxHeight: '180px', objectFit: 'cover' }}
            />
          </div>
        )}

        {msg.text && (
          <div
            className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
            style={{
              background: isMine ? '#6d28d9' : '#252638',
              color: '#fff',
              borderRadius: isMine
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
            }}
          >
            {msg.text}
          </div>
        )}

        <span className="text-xs px-1" style={{ color: '#6b7280' }}>
          {time}
        </span>
      </div>
    </div>
  )
}
