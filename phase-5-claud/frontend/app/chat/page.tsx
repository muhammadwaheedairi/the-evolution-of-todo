import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  // Server-side authentication check
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const userId = cookieStore.get('user_id')?.value

  // Redirect to login if not authenticated
  if (!token || !userId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Chat container - centered with proper sizing */}
      <div className="w-full max-w-4xl h-[calc(100vh-2rem)] max-h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  )
}