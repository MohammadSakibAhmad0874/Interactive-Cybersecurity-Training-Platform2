import { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../App'
import { Send, MessageCircle, Search, Bot, Menu, X, Smile } from 'lucide-react'
import { matches as matchesApi, chat as chatApi } from '../services/api'
import './ChatPage.css'

export default function ChatPage() {
  const { userId } = useParams()
  const { user, token } = useContext(AuthContext)
  const [contacts, setContacts]     = useState([])
  const [activeChat, setActiveChat] = useState(userId || null)
  const [messages, setMessages]     = useState([])
  const [newMsg, setNewMsg]         = useState('')
  const [chatUser, setChatUser]     = useState(null)
  const [search, setSearch]         = useState('')
  const [isTyping, setIsTyping]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)

  useEffect(() => {
    matchesApi.getMatches(20)
      .then(data => setContacts(data.matches || []))
      .catch(() => {})
  }, [token])

  const fetchMessages = useCallback(() => {
    if (!activeChat) return
    chatApi.getHistory(activeChat)
      .then(data => setMessages(data.messages || []))
      .catch(() => {})
  }, [activeChat, token])

  useEffect(() => {
    if (activeChat) {
      fetchMessages()
      const found = contacts.find(c => c.id === activeChat)
      setChatUser(found || null)
      setSidebarOpen(false)
    }
  }, [activeChat, contacts, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setNewMsg(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px' }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return

    const msgText = newMsg.trim()
    const msg = {
      id: Date.now().toString(),
      senderId: user.id,
      text: msgText,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setNewMsg('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const data = await chatApi.sendMessage(activeChat, msgText)
      if (data.autoReply) {
        setIsTyping(true)
        const delay = 1500 + Math.random() * 1000
        setTimeout(() => {
          setIsTyping(false)
          setMessages(prev => [...prev, data.autoReply])
        }, delay)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Format **bold** markers
  const formatMsg = (text) => {
    if (!text) return ''
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i}>{part.slice(2, -2)}</strong>
      return part
    })
  }

  const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="chat-page">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="sidebar-heading-row">
            <span className="sidebar-title">
              <MessageCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Messages
            </span>
            <span className="sidebar-count">{contacts.length}</span>
          </div>
          <div className="sidebar-search">
            <Search size={14} className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search contacts"
            />
          </div>
        </div>

        <div className="chat-matches-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((c, i) => (
              <button
                key={c.id}
                className={`chat-match-item ${activeChat === c.id ? 'selected' : ''}`}
                onClick={() => setActiveChat(c.id)}
                id={`contact-${i}`}
              >
                <div className="avatar avatar-sm"
                  style={{ background: `hsl(${(i * 60 + 220) % 360}, 65%, 58%)` }}>
                  {c.name?.charAt(0).toUpperCase()}
                </div>
                <div className="chat-match-text">
                  <span className="chat-match-name">{c.name}</span>
                  <span className="chat-match-preview">{c.country || 'Tap to chat'}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="sidebar-empty">
              <MessageCircle size={28} style={{ opacity: 0.3 }} />
              <p>No matches yet — discover first!</p>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="chat-main">
        {activeChat && chatUser ? (
          <>
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <button className="nav-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                  <Menu size={19} />
                </button>
                <div className="avatar"
                  style={{ background: 'var(--gradient-primary)' }}>
                  {chatUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="chat-header-info">
                  <span className="chat-header-name">{chatUser.name}</span>
                  <span className="chat-header-status">
                    <span className="chat-status-dot" />
                    {chatUser.country}{chatUser.role ? ` · ${chatUser.role.replace(/_/g, ' ')}` : ''}
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="nav-icon-btn" title="View profile">
                  <Bot size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages" id="chat-messages">
              {messages.length > 0 ? (
                <>
                  <div className="chat-date-divider">
                    <span>Today</span>
                  </div>
                  {messages.map(msg => {
                    const isSent = msg.senderId === user.id
                    return (
                      <div key={msg.id} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                        {!isSent && (
                          <div className="chat-avatar"
                            style={{ background: 'var(--gradient-primary)' }}>
                            {chatUser.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          {msg.isAutoReply && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Bot size={10} /> Auto-reply
                            </div>
                          )}
                          <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                            <p>{formatMsg(msg.text)}</p>
                          </div>
                          <div className="message-time">{fmtTime(msg.timestamp)}</div>
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="chat-no-selection" style={{ flex: 1 }}>
                  <div className="chat-no-selection-icon">
                    <MessageCircle size={32} style={{ color: 'var(--primary-light)' }} />
                  </div>
                  <h3>Start the conversation</h3>
                  <p>Say hello 👋 — {chatUser.name} will reply!</p>
                </div>
              )}

              {isTyping && (
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <form onSubmit={sendMessage} style={{ display: 'contents' }}>
                <div className="chat-input-row">
                  <div className="chat-input-actions">
                    <button type="button" className="chat-action-btn" title="Emoji">
                      <Smile size={18} />
                    </button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    className="chat-input-text"
                    placeholder="Type a message…"
                    value={newMsg}
                    onChange={handleInputChange}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                    rows={1}
                    id="chat-input"
                    aria-label="Message input"
                  />
                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMsg.trim()}
                    id="chat-send"
                    aria-label="Send message"
                  >
                    <Send size={17} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="chat-no-selection">
            <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)} style={{ marginBottom: 'var(--space-md)' }}>
              <Menu size={17} /> Open contacts
            </button>
            <div className="chat-no-selection-icon">
              <MessageCircle size={32} style={{ color: 'var(--primary-light)' }} />
            </div>
            <h3>Select a Conversation</h3>
            <p>Choose a match from the sidebar to start chatting and building your dream team.</p>
          </div>
        )}
      </div>
    </div>
  )
}
