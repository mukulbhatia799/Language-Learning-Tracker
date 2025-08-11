// client/src/pages/Chat.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { listPeers, historyWith, sendMessage } from '../services/chat';
import { getSocket } from '../socket';
import useAuth from '../hooks/useAuth';

function PeerItem({ peer, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl border ${active ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}
    >
      <div className="font-medium">{peer.name}</div>
      <div className="text-xs text-gray-500">{peer.email}</div>
    </button>
  );
}

function Bubble({ mine, text, time }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : ''}`}>
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-soft ${mine ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200'}`}>
        <div>{text}</div>
        {time && <div className={`mt-1 text-[10px] ${mine ? 'text-white/80' : 'text-gray-400'}`}>{new Date(time).toLocaleTimeString()}</div>}
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [peers, setPeers] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const listRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try { setPeers(await listPeers()); } catch { setPeers([]); }
    })();
  }, []);

  // load history + join room
  useEffect(() => {
    const socket = getSocket();
    if (!activePeer || !socket) return;

    (async () => {
      setMsgs(await historyWith(activePeer._id, 60));
      socket.emit('chat:join', { peerId: activePeer._id });
    })();

    const onMessage = (m) => {
      // Only accept messages for this thread
      if (m.from === activePeer._id || m.to === activePeer._id) {
        setMsgs(prev => [...prev, m]);
      }
    };
    const onTyping = ({ from, typing }) => {
      if (from === activePeer._id) setPeerTyping(!!typing);
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.emit('chat:leave', { peerId: activePeer._id });
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [activePeer]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, peerTyping]);

  function startTyping() {
    const socket = getSocket();
    if (!socket || !activePeer) return;
    if (!typing) {
      setTyping(true);
      socket.emit('chat:typing', { peerId: activePeer._id, typing: true });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      socket.emit('chat:typing', { peerId: activePeer._id, typing: false });
    }, 900);
  }

  async function send() {
    const text = input.trim();
    if (!text || !activePeer) return;
    const msg = await sendMessage(activePeer._id, text);
    setMsgs(prev => [...prev, msg]);
    setInput('');
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: peers */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Chats</div>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {peers.map(p => (
              <PeerItem key={p._id} peer={p} active={activePeer?._id === p._id} onClick={() => setActivePeer(p)} />
            ))}
            {peers.length === 0 && <div className="text-sm text-gray-500">No peers found.</div>}
          </div>
        </div>

        {/* Right: messages */}
        <div className="md:col-span-2 card">
          {!activePeer ? (
            <div className="text-sm text-gray-500">Select a chat from the left.</div>
          ) : (
            <div className="flex flex-col h-[70vh]">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <div>
                  <div className="font-semibold">{activePeer.name}</div>
                  <div className="text-xs text-gray-500">{activePeer.email}</div>
                </div>
                <span className="badge">Direct message</span>
              </div>

              <div ref={listRef} className="flex-1 space-y-3 overflow-auto pr-1">
                {msgs.map(m => (
                  <Bubble key={m._id} mine={m.from === user?._id} text={m.text} time={m.createdAt} />
                ))}
                {peerTyping && <div className="text-xs text-gray-500">Typing…</div>}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder={`Message ${activePeer.name}`}
                  value={input}
                  onChange={e => { setInput(e.target.value); startTyping(); }}
                  onKeyDown={e => { if (e.key === 'Enter') send(); }}
                />
                <button className="btn btn-primary" onClick={send}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
