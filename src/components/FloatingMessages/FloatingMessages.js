import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, X, Send, List, ArrowLeft } from 'lucide-react';
import { useAppData } from '../../data/useAppData.js';
import './FloatingMessages.css';

export default function FloatingMessages({ isOpen, onToggle, onOpenFullMessages, currentUser }) {
  const { messages: initialMessages, addMessage } = useAppData();
  const [messages, setMessages] = useState(initialMessages);

  // Keep local copy in sync with the global store (other components can add messages too)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  const [activeTab, setActiveTab] = useState('quick');
  const [recipient, setRecipient] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [chatDraft, setChatDraft] = useState('');

  const senderName = currentUser?.name || 'User';
  const senderRole = currentUser?.role || 'student';

  const contacts = useMemo(() => {
    const seen = new Set();
    const list = [];
    messages.forEach((msg) => {
      if (!seen.has(msg.sender)) { seen.add(msg.sender); list.push(msg.sender); }
      if (!seen.has(msg.recipient)) { seen.add(msg.recipient); list.push(msg.recipient); }
    });
    return list.filter((name) => name !== senderName);
  }, [messages, senderName]);

  const unreadCount = messages.filter((m) => !m.read && m.recipientRole === senderRole).length;

  const conversations = useMemo(() => {
    const map = new Map();
    messages.forEach((msg) => {
      if (!map.has(msg.conversationId)) map.set(msg.conversationId, []);
      map.get(msg.conversationId).push(msg);
    });
    return Array.from(map.entries())
      .map(([id, items]) => {
        const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
        const latest = sorted[sorted.length - 1];
        const myTouch = sorted.find((m) => m.senderRole === senderRole);
        const title = myTouch
          ? (myTouch.senderRole === senderRole ? myTouch.recipient : myTouch.sender)
          : latest.sender;
        return { id, title, latest, messages: sorted };
      })
      .sort((a, b) => b.latest.time.localeCompare(a.latest.time));
  }, [messages, senderRole]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    const body = quickMessage.trim();
    if (!body || !recipient) return;

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newMessage = {
      conversationId: `quick-${Date.now()}`,
      sender: senderName,
      senderRole,
      recipient,
      recipientRole: 'multi',
      text: body,
      time: now,
      read: false,
    };

    addMessage(newMessage);
    setQuickMessage('');
  };

  const handleSendInConversation = (e) => {
    e.preventDefault();
    if (!chatDraft.trim() || !activeConversation) return;
    const latest = activeConversation.messages[activeConversation.messages.length - 1];
    const recipientName = latest.senderRole === senderRole ? latest.recipient : latest.sender;
    const recipientRole = latest.senderRole === senderRole ? latest.recipientRole : latest.senderRole;
    const newMessage = {
      conversationId: activeConversation.id,
      sender: senderName,
      senderRole,
      recipient: recipientName,
      recipientRole,
      text: chatDraft.trim(),
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: false,
    };
    addMessage(newMessage);
    setChatDraft('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fm-floating-button"
        onClick={() => onToggle(!isOpen)}
        title="Messages"
        aria-label="Open messages"
      >
        <MessageSquare size={20} />
        {unreadCount > 0 && <span className="fm-badge">{unreadCount}</span>}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fm-panel">
          <div className="fm-header">
            <h3>Messages</h3>
            <button
              className="fm-close-btn"
              onClick={() => onToggle(false)}
              title="Close"
              aria-label="Close messages"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="fm-tabs">
            <button
              className={`fm-tab ${activeTab === 'quick' ? 'active' : ''}`}
              onClick={() => setActiveTab('quick')}
            >
              <Send size={14} /> Quick Message
            </button>
            <button
              className={`fm-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <List size={14} /> View All
            </button>
          </div>

          {/* Content */}
          <div className="fm-content">
            {activeTab === 'quick' ? (
              <form onSubmit={handleSendMessage} className="fm-form">
                <label htmlFor="fm-quick-to" className="fm-label">Send to</label>
                <select
                  id="fm-quick-to"
                  className="fm-select"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                >
                  <option value="">Choose recipient</option>
                  {contacts.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <label htmlFor="fm-quick-msg" className="fm-label">Message</label>
                <textarea
                  id="fm-quick-msg"
                  className="fm-textarea"
                  placeholder="Type your message here..."
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  rows="4"
                />
                <button
                  type="submit"
                  className="fm-submit"
                  disabled={!quickMessage.trim() || !recipient}
                >
                  <Send size={14} /> Send Message
                </button>
              </form>
            ) : (
              <div className="fm-list">
                {messages.length === 0 ? (
                  <p className="fm-empty">No messages yet.</p>
                ) : (
                  <>
                    <p className="fm-list-info">All messages ({messages.length})</p>
                    {onOpenFullMessages && (
                      <button
                        type="button"
                        className="fm-view-all-btn"
                        onClick={() => {
                          onToggle(false);
                          onOpenFullMessages();
                        }}
                      >
                        <List size={14} /> View all messages
                      </button>
                    )}
                    {!activeConversation ? (
                      <ul className="fm-conversations">
                        {conversations.map((conv) => (
                          <li key={conv.id}>
                            <button
                              type="button"
                              className="fm-conversation-btn"
                              onClick={() => setActiveConversationId(conv.id)}
                            >
                              <div className="fm-msg-header">
                                <strong className="fm-msg-from">{conv.title}</strong>
                                <span className="fm-msg-time">{conv.latest.time}</span>
                              </div>
                              <p className="fm-msg-text">{conv.latest.text}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="fm-chat-view">
                        <button
                          type="button"
                          className="fm-back-btn"
                          onClick={() => { setActiveConversationId(null); setChatDraft(''); }}
                        >
                          <ArrowLeft size={14} /> Back to conversations
                        </button>
                        <ul className="fm-messages">
                          {activeConversation.messages.map((msg) => (
                            <li key={msg.id} className={`fm-message ${msg.senderRole === senderRole ? 'mine' : ''}`}>
                              <div className="fm-msg-header">
                                <strong className="fm-msg-from">{msg.sender}</strong>
                                <span className="fm-msg-time">{msg.time}</span>
                              </div>
                              <p className="fm-msg-text">{msg.text}</p>
                            </li>
                          ))}
                        </ul>
                        <form className="fm-chat-input-row" onSubmit={handleSendInConversation}>
                          <input
                            type="text"
                            value={chatDraft}
                            onChange={(e) => setChatDraft(e.target.value)}
                            placeholder={`Message ${activeConversation.title}`}
                          />
                          <button type="submit" disabled={!chatDraft.trim()}>
                            <Send size={13} /> Send
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
