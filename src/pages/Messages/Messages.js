import React, { useState, useRef, useEffect } from 'react';
import { useAppData } from '../../data/useAppData.js';
import { Send, Plus, X } from 'lucide-react';
import './Messages.css';

const RECIPIENT_OPTIONS = [
  { value: 'employer', label: 'Employer' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
  { value: 'student', label: 'Student' },
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(timeStr) {
  try {
    const date = new Date(timeStr.replace(' ', 'T'));
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return timeStr;
  }
}

export default function Messages({ user }) {
  const { messages: initialMessages, updateMessages } = useAppData();
  const [messages, setMessages] = useState(initialMessages);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [draft, setDraft] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChat, setNewChat] = useState({ recipientRole: 'employer', text: '' });
  const bottomRef = useRef(null);

  const myMessages = messages.filter(
    (m) => m.senderRole === user.role || m.recipientRole === user.role
  );

  const conversationMap = {};
  myMessages.forEach((m) => {
    if (!conversationMap[m.conversationId]) conversationMap[m.conversationId] = [];
    conversationMap[m.conversationId].push(m);
  });

  const conversations = Object.entries(conversationMap).map(([convId, msgs]) => {
    const sorted = [...msgs].sort((a, b) => a.time.localeCompare(b.time));
    const last = sorted[sorted.length - 1];
    const first = sorted[0];

    const contact = first.senderRole === user.role
      ? { name: first.recipient, role: first.recipientRole }
      : { name: first.sender, role: first.senderRole };

    const unread = msgs.filter((m) => m.recipientRole === user.role && !m.read).length;

    return { id: convId, contact, lastMessage: last.text, lastTime: last.time, unread, messages: sorted };
  }).sort((a, b) => b.lastTime.localeCompare(a.lastTime));

  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, []); // eslint-disable-line

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const convMessages = selectedConv?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, messages.length]);

  const openConversation = (convId) => {
    setSelectedConvId(convId);
    const updatedMessages = messages.map((m) =>
      m.conversationId === convId && m.recipientRole === user.role ? { ...m, read: true } : m
    );
    setMessages(updatedMessages);
    updateMessages(updatedMessages);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedConv) return;
    const newMsg = {
      id: Date.now(),
      conversationId: selectedConvId,
      sender: user.name,
      senderRole: user.role,
      recipient: selectedConv.contact.name,
      recipientRole: selectedConv.contact.role,
      text: draft.trim(),
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: false,
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    updateMessages(updatedMessages);
    setDraft('');
  };

  const startNewChat = (e) => {
    e.preventDefault();
    if (!newChat.text.trim()) return;
    const convId = `new-${Date.now()}`;
    const contactLabel = RECIPIENT_OPTIONS.find((o) => o.value === newChat.recipientRole)?.label || newChat.recipientRole;
    const newMsg = {
      id: Date.now(),
      conversationId: convId,
      sender: user.name,
      senderRole: user.role,
      recipient: contactLabel,
      recipientRole: newChat.recipientRole,
      text: newChat.text.trim(),
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: false,
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    updateMessages(updatedMessages);
    setNewChat({ recipientRole: 'employer', text: '' });
    setNewChatOpen(false);
    setSelectedConvId(convId);
  };

  return (
    <div className="dm-root">
      <aside className="dm-sidebar">
        <div className="dm-sidebar-header">
          <h2>Messages</h2>
          <button className="dm-new-btn" onClick={() => setNewChatOpen(true)} title="New chat">
            <Plus size={18} />
          </button>
        </div>

        <div className="dm-conv-list">
          {conversations.length === 0 ? (
            <p className="dm-empty">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`dm-conv-item${selectedConvId === conv.id ? ' active' : ''}`}
                onClick={() => openConversation(conv.id)}
              >
                <div className="dm-avatar">{getInitials(conv.contact.name)}</div>
                <div className="dm-conv-info">
                  <div className="dm-conv-top">
                    <span className="dm-conv-name">{conv.contact.name}</span>
                    <span className="dm-conv-time">{formatTime(conv.lastTime)}</span>
                  </div>
                  <div className="dm-conv-bottom">
                    <span className="dm-conv-preview">{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span className="dm-unread-badge">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="dm-main">
        {selectedConv ? (
          <>
            <div className="dm-chat-header">
              <div className="dm-avatar dm-avatar-md">{getInitials(selectedConv.contact.name)}</div>
              <div>
                <p className="dm-chat-name">{selectedConv.contact.name}</p>
                <p className="dm-chat-role">{selectedConv.contact.role}</p>
              </div>
            </div>

            <div className="dm-messages">
              {convMessages.map((m) => {
                const isMine = m.senderRole === user.role;
                return (
                  <div key={m.id} className={`dm-bubble-wrap${isMine ? ' mine' : ''}`}>
                    {!isMine && (
                      <div className="dm-bubble-avatar">{getInitials(m.sender)}</div>
                    )}
                    <div className="dm-bubble-col">
                      <div className={`dm-bubble${isMine ? ' mine' : ''}`}>{m.text}</div>
                      <span className="dm-bubble-time">{formatTime(m.time)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form className="dm-input-bar" onSubmit={sendMessage}>
              <input
                className="dm-input"
                placeholder={`Message ${selectedConv.contact.name}…`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
              />
              <button type="submit" className="dm-send-btn" disabled={!draft.trim()}>
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="dm-placeholder">
            <p>Select a conversation or start a new one.</p>
          </div>
        )}
      </main>

      {newChatOpen && (
        <div className="dm-modal-backdrop" onClick={() => setNewChatOpen(false)}>
          <div className="dm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h3>New message</h3>
              <button type="button" onClick={() => setNewChatOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="dm-modal-form" onSubmit={startNewChat}>
              <label>
                Send to
                <select
                  value={newChat.recipientRole}
                  onChange={(e) => setNewChat((prev) => ({ ...prev, recipientRole: e.target.value }))}
                >
                  {RECIPIENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Message
                <textarea
                  value={newChat.text}
                  onChange={(e) => setNewChat((prev) => ({ ...prev, text: e.target.value }))}
                  rows={4}
                  placeholder="Type your message…"
                />
              </label>
              <div className="dm-modal-actions">
                <button type="submit" className="dm-send-primary">Send</button>
                <button type="button" onClick={() => setNewChatOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
