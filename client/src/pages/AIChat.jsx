import { useState } from 'react'
import { MessageCircle, Send, Bot, User } from 'lucide-react'

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'नमस्ते! मैं PoultryMitra AI हूं। आप मुझसे poultry farming के बारे में कोई भी सवाल पूछ सकते हैं।' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.response || 'माफ़ कीजिए, कुछ error हो गया।' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Server error - बाद में कोशिश करें।' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        AI Assistant
      </h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && <Bot className="w-5 h-5 text-blue-500 mt-1" />}
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
            {msg.role === 'user' && <User className="w-5 h-5 text-gray-500 mt-1" />}
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">Thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="अपना सवाल लिखें..."
          className="flex-1 p-3 border rounded-lg"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}