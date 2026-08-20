import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Plus,
  Send,
  Paperclip,
  Settings,
  Trash2,
  FileText,
  Sparkles,
  Brain,
  Loader2,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { supabase, type Profile, type ChatConversation, type ChatMessageRow, type DocumentRow, type CognitiveScoreLite } from '@/lib/supabase';
import { sendChatMessage, generateQuiz, fetchCognitiveScores, type ChatMessage, type QuizQuestion } from '@/lib/gemini';
import { extractPdfText } from '@/lib/pdf';
import { Logo } from '@/components/Logo';
import { QuizCard } from './QuizCard';

interface DashboardProps {
  profile: Profile;
  onSignOut: () => Promise<void>;
}

export function ChatDashboard({ profile, onSignOut }: DashboardProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentRow | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cognitiveScoresRef = useRef<CognitiveScoreLite[]>([]);

  // Load conversations list
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  // Load cognitive scores once
  useEffect(() => {
    if (!user) return;
    fetchCognitiveScores(user.id).then((scores) => {
      cognitiveScoresRef.current = scores;
    });
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    loadMessages(activeConversationId);
  }, [activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    if (!user) return;
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) {
      setError('Could not load your chat history.');
      return;
    }
    setConversations((data as ChatConversation[]) ?? []);
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) {
      setError('Could not load this conversation.');
      return;
    }
    setMessages((data as ChatMessageRow[]) ?? []);
  }

  async function createNewConversation(): Promise<string | null> {
    if (!user) return null;
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .maybeSingle();
    if (error || !data) {
      setError('Could not start a new conversation.');
      return null;
    }
    const conv = data as ChatConversation;
    setConversations((prev) => [conv, ...prev]);
    return conv.id;
  }

  async function deleteConversation(id: string) {
    const { error } = await supabase.from('chat_conversations').delete().eq('id', id);
    if (error) {
      setError('Could not delete this conversation.');
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }

  async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string, metadata: Record<string, unknown> = {}) {
    if (!user) return null;
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content,
        metadata,
      })
      .select()
      .maybeSingle();
    if (error) return null;
    return data as ChatMessageRow | null;
  }

  async function updateConversationTitle(conversationId: string, title: string) {
    if (!user) return;
    await supabase
      .from('chat_conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
    );
  }

  async function touchConversation(conversationId: string) {
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  async function handleSend() {
    if (!input.trim() || loading || !user) return;
    const text = input.trim();
    setInput('');
    setError(null);

    // Create conversation if none active
    let convId = activeConversationId;
    if (!convId) {
      convId = await createNewConversation();
      if (!convId) return;
      setActiveConversationId(convId);
    }

    // Save user message
    const savedUserMsg = await saveMessage(convId, 'user', text);
    if (savedUserMsg) setMessages((prev) => [...prev, savedUserMsg]);

    // Auto-title from first message
    const conv = conversations.find((c) => c.id === convId);
    if (conv && conv.title === 'New Chat') {
      updateConversationTitle(convId, text.slice(0, 40));
    }

    setLoading(true);

    try {
      const chatHistory: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text },
      ];

      const docText = uploadedDoc?.text_content || undefined;
      const response = await sendChatMessage(chatHistory, profile, cognitiveScoresRef.current, docText);

      const savedAssistantMsg = await saveMessage(convId, 'assistant', response);
      if (savedAssistantMsg) setMessages((prev) => [...prev, savedAssistantMsg]);
      await touchConversation(convId);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(errMsg);
      const savedErr = await saveMessage(convId, 'assistant', `Sorry, I ran into an issue: ${errMsg}`);
      if (savedErr) setMessages((prev) => [...prev, savedErr]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!user) {
      setError('You must be signed in to upload files.');
      return;
    }
    if (!isPdf) {
      setError('Please upload a PDF file. Other formats will be supported soon.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('That PDF is too large. Please keep it under 20 MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { text, pageCount } = await extractPdfText(file);

      if (!text.trim()) {
        setError('This PDF appears to have no extractable text. It may be a scanned image.');
        return;
      }

      // Create conversation if none active
      let convId = activeConversationId;
      if (!convId) {
        convId = await createNewConversation();
        if (!convId) return;
        setActiveConversationId(convId);
      }

      // Save document record
      const { data, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          conversation_id: convId,
          filename: file.name,
          page_count: pageCount,
          text_content: text,
        })
        .select()
        .maybeSingle();

      if (docError || !data) {
        setError('Could not save your document. Please try again.');
        return;
      }

      const doc = data as DocumentRow;
      setUploadedDoc(doc);

      // Add a system-style message about the upload
      const uploadMsg = await saveMessage(convId, 'assistant', `📄 **${file.name}** uploaded — ${pageCount} page${pageCount !== 1 ? 's' : ''}. You can now ask me questions about this document, or say "quiz me" to generate a quiz from it!`);
      if (uploadMsg) setMessages((prev) => [...prev, uploadMsg]);

      await touchConversation(convId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not read this PDF: ${msg}. It may be corrupted or password-protected.`);
    } finally {
      setUploading(false);
    }
  }

  async function handleQuizRequest() {
    if (loading || !user) return;
    setLoading(true);
    setError(null);

    try {
      let convId = activeConversationId;
      if (!convId) {
        convId = await createNewConversation();
        if (!convId) return;
        setActiveConversationId(convId);
      }

      const docText = uploadedDoc?.text_content || undefined;
      const questions = await generateQuiz(profile, cognitiveScoresRef.current, docText);

      // Save a message with quiz metadata
      const quizMsg = await saveMessage(convId, 'assistant', 'Here is your quiz! Good luck.', {
        type: 'quiz',
        questions,
      });
      if (quizMsg) setMessages((prev) => [...prev, quizMsg]);
      await touchConversation(convId);
    } catch (err) {
      setError('Could not generate a quiz right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuizComplete(score: number, total: number) {
    if (!user || !activeConversationId) return;
    await supabase.from('quiz_scores').insert({
      user_id: user.id,
      conversation_id: activeConversationId,
      document_id: uploadedDoc?.id ?? null,
      subject: profile.favorite_subject ?? null,
      score,
      total_questions: total,
    });
  }

  function handleNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setUploadedDoc(null);
    setError(null);
    setSidebarOpen(false);
  }

  function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    setUploadedDoc(null);
    setError(null);
    setSidebarOpen(false);
  }

  return (
    <div className="app-bg flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* New Chat button */}
        <div className="border-b border-white/10 p-4">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-violet px-4 py-3 font-display font-semibold text-white shadow-neon-purple transition-all hover:-translate-y-0.5 hover:shadow-neon-magenta"
          >
            <Plus className="h-5 w-5" />
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-lavender-200/40">
            Recent conversations
          </p>
          {conversations.length === 0 ? (
            <p className="px-2 py-4 text-sm text-lavender-200/40">No conversations yet.</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    activeConversationId === conv.id
                      ? 'bg-neon-purple/15 text-white'
                      : 'text-lavender-200/60 hover:bg-white/5 hover:text-lavender-100'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-neon-magenta/60 hover:text-neon-magenta" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile / settings */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan text-sm font-bold text-white">
              {(profile.name?.[0] ?? 'S').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{profile.name ?? 'Student'}</p>
              <p className="truncate text-xs text-lavender-200/50">{profile.grade ?? 'Learner'}</p>
            </div>
            <button
              onClick={() => void onSignOut()}
              className="text-lavender-200/40 transition-colors hover:text-white"
              title="Log out"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-ink-950/40 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-lavender-200/60 hover:text-white lg:hidden"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-2 text-sm text-lavender-200/50">
            <Sparkles className="h-4 w-4 text-neon-cyan" />
            <span className="hidden sm:inline">AI Study Tutor</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && !loading && (
              <WelcomeScreen onQuiz={handleQuizRequest} onUpload={() => fileInputRef.current?.click()} />
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onQuizComplete={handleQuizComplete} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-lavender-200/50">
                <Loader2 className="h-4 w-4 animate-spin text-neon-purple" />
                <span className="text-sm">Thinking…</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-neon-magenta/40 bg-neon-magenta/10 px-4 py-3 text-sm text-neon-magenta">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Uploaded doc indicator */}
        {uploadedDoc && (
          <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4">
            <div className="flex items-center gap-2 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-sm text-neon-cyan">
              <FileText className="h-4 w-4" />
              <span className="truncate">{uploadedDoc.filename}</span>
              <span className="text-lavender-200/40">• {uploadedDoc.page_count}p</span>
              <button onClick={() => setUploadedDoc(null)} className="ml-1 text-lavender-200/40 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/10 bg-ink-950/40 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-800/70 p-2 focus-within:border-neon-purple/50 focus-within:shadow-neon-purple">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lavender-200/50 transition-colors hover:bg-white/5 hover:text-neon-cyan disabled:opacity-50"
                title="Upload PDF"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask your AI tutor anything…"
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent py-2.5 text-white placeholder:text-lavender-200/30 outline-none"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-violet text-white shadow-neon-purple transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1">
              <button
                onClick={handleQuizRequest}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-lavender-200/40 transition-colors hover:text-neon-cyan disabled:opacity-50"
              >
                <Brain className="h-3.5 w-3.5" />
                Quiz me
              </button>
              <p className="text-xs text-lavender-200/30">Press Enter to send</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onQuiz, onUpload }: { onQuiz: () => void; onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple animate-float">
        <Brain className="h-10 w-10 text-white" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">Your AI Study Tutor</h2>
      <p className="mt-3 max-w-md text-lavender-200/60">
        Ask me anything about your subjects, upload a PDF to study from, or generate a quiz.
        I'm personalized to your learning profile.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <SuggestionCard
          icon={<FileText className="h-5 w-5" />}
          title="Upload a PDF"
          desc="Upload your notes and I'll help you study from them"
          onClick={onUpload}
        />
        <SuggestionCard
          icon={<Brain className="h-5 w-5" />}
          title="Generate a quiz"
          desc="Test yourself with a 5-question quiz"
          onClick={onQuiz}
        />
      </div>
    </div>
  );
}

function SuggestionCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-white/10 bg-ink-900/70 p-4 text-left transition-all hover:border-neon-purple/30 hover:shadow-neon-purple"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neon-purple/15 text-neon-purple">
        {icon}
      </div>
      <div>
        <p className="font-display font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-sm text-lavender-200/50">{desc}</p>
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  onQuizComplete,
}: {
  message: ChatMessageRow;
  onQuizComplete: (score: number, total: number) => void;
}) {
  const isUser = message.role === 'user';
  const metadata = message.metadata as { type?: string; questions?: QuizQuestion[] };

  // Render quiz card if metadata indicates quiz
  if (metadata?.type === 'quiz' && metadata.questions) {
    return (
      <div className="flex justify-start">
        <div className="max-w-full">
          <div className="mb-2 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan text-xs font-bold text-white">
              AI
            </div>
            <span className="text-xs text-lavender-200/40">AI Tutor</span>
          </div>
          <QuizCard questions={metadata.questions} onComplete={onQuizComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-up`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan text-xs font-bold text-white">
              AI
            </div>
            <span className="text-xs text-lavender-200/40">AI Tutor</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-neon-purple/20 to-neon-violet/20 border border-neon-purple/30 text-white'
              : 'border border-white/10 bg-ink-900/70 text-lavender-100'
          }`}
        >
          <MarkdownContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown rendering: bold, headers, lists, line breaks
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h3 key={i} className="font-display text-base font-semibold text-white">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="font-display text-lg font-semibold text-white">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="font-display text-xl font-bold text-white">{line.slice(2)}</h1>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-neon-cyan">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={i} className="h-1.5" />;
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
