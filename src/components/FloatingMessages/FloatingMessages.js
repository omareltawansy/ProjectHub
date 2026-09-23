import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, X, Send, List, ArrowLeft } from 'lucide-react';
import { useAppData } from '../../data/useAppData.js';
import { nowStamp } from '../../utils/time';
import { isSender, isRecipient, involvesUser } from '../../utils/messages';
import './FloatingMessages.css';

export default function FloatingMessages({ isOpen, onToggle, onOpenFullMessages, currentUser }) {
  const { messages: allMessages, addMessage, users } = useAppData();
  const initialMessages = useMemo(
    () => allMessages.filter((m) => involvesUser(m, currentUser)),
    [allMessages, currentUser]
  );
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

  // Anyone active on the platform other than yourself, addressed by email.
  const contacts = useMemo(
    () => (users || []).filter((u) => u.email !== currentUser?.email && u.active !== false),
    [users, currentUser]
  );

  const unreadCount = messages.filter((m) => !m.read && isRecipient(m, currentUser)).length;

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
        const title = isSender(sorted[0], currentUser) ? sorted[0].recipient : sorted[0].sender;
        return { id, title, latest, messages: sorted };
      })
      .sort((a, b) => b.latest.time.localeCompare(a.latest.time));
  }, [messages, currentUser]);

  // Escape closes the panel (it's a popup, not a modal, so no focus trap).
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onToggle(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onToggle]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    const body = quickMessage.trim();
    if (!body || !recipient) return;

    const to = contacts.find((u) => u.email === recipient);
    if (!to) return;
    const newMessage = {
      conversationId: `quick-${Date.now()}`,
      sender: senderName,
      senderRole,
      senderEmail: currentUser?.email,
      recipient: to.name,
      recipientRole: to.role,
      recipientEmail: to.email,
      text: body,
      time: nowStamp(),
      read: false,
    };

    addMessage(newMessage);
    setQuickMessage('');
  };

  const handleSendInConversation = (e) => {
    e.preventDefault();
    if (!chatDraft.trim() || !activeConversation) return;
    const latest = activeConversation.messages[activeConversation.messages.length - 1];
    const mine = isSender(latest, currentUser);
    const newMessage = {
      conversationId: activeConversation.id,
      sender: senderName,
      senderRole,
      senderEmail: currentUser?.email,
      recipient: mine ? latest.recipient : latest.sender,
      recipientRole: mine ? latest.recipientRole : latest.senderRole,
      recipientEmail: mine ? latest.recipientEmail : latest.senderEmail,
      text: chatDraft.trim(),
      time: nowStamp(),
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
        aria-label={isOpen ? 'Close messages' : 'Open messages'}
        aria-expanded={isOpen}
      >
        <MessageSquare size={20} />
        {unreadCount > 0 && <span className="fm-badge">{unreadCount}</span>}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fm-panel" role="region" aria-label="Messages">
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
                  {contacts.map((u) => (
                    <option key={u.email} value={u.email}>{u.name} ({u.role})</option>
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
                            <li key={msg.id} className={`fm-message ${isSender(msg, currentUser) ? 'mine' : ''}`}>
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
