import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { UIMessage } from 'ai';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  // Fetch the chat and its messages
  const chat = await getChatById({ id });
  if (!chat) {
    notFound();
  }

  const dbMessages = await getMessagesByChatId({ id });
  
  // Transform database messages into UIMessages
  const messages: UIMessage[] = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system' | 'data',
    content: Array.isArray(msg.parts) && msg.parts[0]?.text ? msg.parts[0].text : '',
    parts: Array.isArray(msg.parts) ? msg.parts : [],
    attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
  }));

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={messages}
        selectedChatModel={modelIdFromCookie?.value || DEFAULT_MODEL_NAME}
        selectedVisibilityType={chat.visibility}
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
} 