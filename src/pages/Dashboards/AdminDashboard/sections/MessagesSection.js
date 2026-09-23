import React, { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { nowStamp } from '../../../../utils/time';
import './MessagesSection.css';

function formatTime(timeStr) {
  try {
    const date = new Date(timeStr.replace(' ', 'T'));
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return timeStr;
  }
}

function getConversations(messages) {
  const map = new Map();
  messages.forEach((m) => {
    if (!map.has(m.conversationId)) map.set(m.conversationId, []);
    map.get(m.conversationId).push(m);
  });

  return Array.from(map.entries())
    .map(([id, items]) => {
      const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
      const latest = sorted[sorted.length - 1];
      const withAdmin = sorted.find((m) => m.senderRole === 'admin' || m.recipientRole === 'admin');
      const title = withAdmin
        ? (withAdmin.senderRole === 'admin' ? withAdmin.recipient : withAdmin.sender)
        : latest.sender;
      return { id, title, messages: sorted, latestTime: latest.time };
    })
    .sort((a, b) => b.latestTime.localeCompare(a.latestTime));
}

export default function MessagesSection({ user }) {
  const { messages: initialMessages, updateMessages } = useAppData();
  const [messages, setMessages] = useState(initialMessages);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [draft, setDraft] = useState('');

  const conversations = useMemo(() => getConversations(messages), [messages]);
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConversation) return;

    const now = nowStamp();
    const latest = activeConversation.messages[activeConversation.messages.length - 1];
    const recipient = latest.senderRole === 'admin' ? latest.recipient : latest.sender;
    const recipientRole = latest.senderRole === 'admin' ? latest.recipientRole : latest.senderRole;

    const next = {
      id: Math.max(0, ...messages.map((m) => Number(m.id) || 0)) + 1,
      conversationId: activeConversation.id,
      sender: user?.name || 'Admin User',
      senderRole: 'admin',
      senderEmail: user?.email,
      recipient,
      recipientRole,
      recipientEmail: latest.senderRole === 'admin' ? latest.recipientEmail : latest.senderEmail,
      text: draft.trim(),
      time: now,
      read: false,
    };
    const updatedMessages = [...messages, next];
    setMessages(updatedMessages);
    updateMessages(updatedMessages);
    setDraft('');
  };

  return (
    <section className="ams-card">
      <header className="ams-head">
        <h2 className="ams-title">Messages</h2>
      </header>

      <div className="ams-body">
        <aside className="ams-conversations">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={`ams-conversation${(activeConversation?.id || conversations[0]?.id) === conv.id ? ' active' : ''}`}
              onClick={() => setActiveConversationId(conv.id)}
            >
              <span className="ams-conv-name">{conv.title}</span>
              <span className="ams-conv-time">{formatTime(conv.latestTime)}</span>
            </button>
          ))}
        </aside>

        <div className="ams-chat">
          {!activeConversation ? (
            <p className="ams-empty">No messages yet.</p>
          ) : (
            <>
              <div className="ams-messages">
                {activeConversation.messages.map((msg) => {
                  const mine = msg.senderRole === 'admin';
                  return (
                    <div key={msg.id} className={`ams-msg-wrap${mine ? ' mine' : ''}`}>
                      <div className={`ams-msg${mine ? ' mine' : ''}`}>
                        {msg.text}
                      </div>
                      <span className="ams-msg-time">{formatTime(msg.time)}</span>
                    </div>
                  );
                })}
              </div>

              <form className="ams-input-row" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeConversation.title}`}
                />
                <button type="submit" disabled={!draft.trim()}>
                  <Send size={14} /> Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
