import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const faqResponses: Record<string, string> = {
  'documents': '📋 **Required Documents for Admission:**\n\n✅ Aadhaar Card\n✅ Marks Memo (10th / 12th / Degree)\n✅ Transfer Certificate (TC)\n✅ Caste Certificate (if applicable)\n✅ Passport Size Photos (4 copies)\n✅ Income Certificate\n✅ Study Certificate\n✅ Bonafide Certificate\n\nAll documents should be self-attested and uploaded as clear scanned copies (PDF or JPEG).',
  'status': '📊 **Checking Your Application Status:**\n\n1. Go to **My Application** in the sidebar\n2. Your current status is shown at the top\n3. The progress stepper shows which stage you\'re at\n4. Check **Pending Documents** section for any missing items\n\nStatuses: Draft → Submitted → Under Review → Approved → Admission Complete',
  'fees': '💰 **Fee Structure (2026-27):**\n\n| Course | Annual Fee |\n|--------|----------|\n| B.Tech CSE | ₹1,20,000 |\n| B.Tech ECE | ₹1,10,000 |\n| B.Tech Mech | ₹1,00,000 |\n| BBA | ₹75,000 |\n| MBA | ₹1,50,000 |\n| MCA | ₹95,000 |\n\n*Scholarships available for meritorious students.*',
  'contact': '📞 **Contact Information:**\n\n🏫 Sri Gowthami Educational Institutions\n📍 Rajahmundry, East Godavari, AP - 533101\n📱 Phone: +91 98765 43210\n📧 Email: admissions@srigowthami.edu.in\n🌐 Website: www.srigowthami.edu.in\n\n⏰ Office Hours: Mon-Sat, 9:00 AM - 5:00 PM',
  'default': '🤖 I can help you with:\n\n• **Document requirements** — What documents to upload\n• **Application status** — How to check your progress\n• **Fee structure** — Course-wise fee details\n• **Contact information** — Reach our admissions office\n\nPlease ask about any of these topics!'
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('document') || lower.includes('require') || lower.includes('upload') || lower.includes('what do i need'))
    return faqResponses['documents']
  if (lower.includes('status') || lower.includes('track') || lower.includes('check') || lower.includes('progress') || lower.includes('where'))
    return faqResponses['status']
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('price') || lower.includes('amount') || lower.includes('pay'))
    return faqResponses['fees']
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('address') || lower.includes('reach'))
    return faqResponses['contact']
  return faqResponses['default']
}

const suggestions = [
  'What documents are required?',
  'How to check application status?',
  'What are the admission fees?',
  'Contact information',
]

export function AIAssistant() {
  const { aiAssistantOpen, setAIAssistantOpen } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hello! I\'m your **AI Assistant** for Sri Gowthami admissions. I can help you with document requirements, application status, fees, and more. How can I assist you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(text)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!aiAssistantOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAIAssistantOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 gradient-primary rounded-full shadow-lg shadow-primary-500/30 flex items-center justify-center text-white z-50 cursor-pointer"
          >
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="gradient-primary px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
                  <p className="text-[10px] text-white/70">Always ready to help</p>
                </div>
              </div>
              <button onClick={() => setAIAssistantOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                      msg.role === 'user'
                        ? 'gradient-primary text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-700 rounded-bl-md'
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left px-4 py-2.5 text-sm bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl transition-colors border border-primary-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 gradient-primary rounded-xl text-white disabled:opacity-40 hover:shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
