import { Check, CheckCheck } from 'lucide-react'

export default function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender === currentUserId
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
        style={{ maxWidth: '82%' }}
      >
        {msg.imageUrl && (
          <div
            className="rounded-2xl overflow-hidden cursor-pointer shadow-sm"
            onClick={() => window.open(msg.imageUrl, '_blank')}
            style={{
              background: isMine ? '#2b5278' : '#182533',
              padding: '4px',
            }}
          >
            <img
              src={msg.imageUrl}
              alt="attachment"
              className="rounded-xl"
              style={{ maxWidth: '280px', maxHeight: '240px', objectFit: 'cover' }}
            />
          </div>
        )}

        {msg.text && (
          <div
            className="px-3.5 py-2 text-sm leading-relaxed shadow-sm relative group"
            style={{
              background: isMine ? '#2b5278' : '#182533',
              color: '#ffffff',
              borderRadius: isMine
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
            }}
          >
            <p className="break-words pr-12">{msg.text}</p>

            {/* Telegram-style inline timestamp & checks */}
            <div className="absolute bottom-1 right-2 flex items-center gap-1">
              <span className="text-[10px] text-gray-300 font-normal">
                {time}
              </span>
              {isMine && (
                <CheckCheck size={13} className="text-sky-300" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
