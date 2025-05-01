"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Bot, X, FileImage, FileText, MessageSquare, Brain } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Chat } from "@/components/chat"
import { generateUUID } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { myProvider, DEFAULT_MODEL_NAME } from "@/lib/ai/models"

interface AIPanelProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Custom hook to log AI responses with message parts
function useAIResponseLogger(chatId: string) {
  const { messages, status } = useChat({ id: chatId })
  
  useEffect(() => {
    if (messages.length > 0 && status !== 'streaming') {
      // Find assistant messages
      const assistantMessages = messages.filter(msg => msg.role === 'assistant')
      
      if (assistantMessages.length > 0) {
        const latestAssistantMessage = assistantMessages[assistantMessages.length - 1]
        
        // Log the response to console with message parts
        console.log('AI Assistant Response:', {
          chatId,
          messageId: latestAssistantMessage.id,
          timestamp: new Date().toISOString(),
          parts: latestAssistantMessage.parts.map(part => ({
            type: part.type,
            // For text parts, include the content
            ...(part.type === 'text' && { text: part.text }),
            // For reasoning parts, include a snippet
            ...(part.type === 'reasoning' && { 
              reasoning: part.reasoning.substring(0, 50) + '...' 
            }),
            // For file parts, include the mime type
            ...(part.type === 'file' && { mimeType: part.mimeType }),
          })),
          status
        })
      }
    }
  }, [messages, status, chatId])

  return { messages, status }
}

// Helper component to render message parts
function MessagePartRenderer({ part }: { part: any }) {
  switch (part.type) {
    case 'text':
      return <div className="text-sm">{part.text}</div>
    case 'reasoning':
      return (
        <div className="flex items-start gap-2 p-2 my-1 bg-muted/50 rounded-md">
          <Brain className="h-4 w-4 mt-1 text-muted-foreground" />
          <div className="text-xs text-muted-foreground">{part.reasoning}</div>
        </div>
      )
    case 'file':
      if (part.mimeType.startsWith('image/')) {
        return (
          <div className="flex items-center gap-2 my-1">
            <FileImage className="h-4 w-4 text-muted-foreground" />
            <img 
              src={`data:${part.mimeType};base64,${part.data}`} 
              alt="Generated image" 
              className="max-w-full rounded-md max-h-64 object-contain" 
            />
          </div>
        )
      }
      return (
        <div className="flex items-center gap-2 my-1 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>File attachment: {part.mimeType}</span>
        </div>
      )
    default:
      return null
  }
}

export function AIPanel({ open, onOpenChange }: AIPanelProps) {
  const [chatId] = useState(() => generateUUID())
  const { status } = useAIResponseLogger(chatId)

  return (
    <SidebarProvider 
      open={open} 
      onOpenChange={onOpenChange}
      style={{
        "--sidebar-width": "32rem", // Wider panel
        "--sidebar-width-icon": "0rem", // No icon state
      } as React.CSSProperties}
    >
      <Sidebar collapsible="offcanvas" side="right">
        <SidebarHeader className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur h-14 supports-[backdrop-filter]:bg-background/60">
          <div className="container flex items-center justify-between h-full">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Language Exam Assistant</h2>
              {status === 'streaming' && <span className="text-xs text-muted-foreground ml-2">(Thinking...)</span>}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange?.(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="h-[calc(100vh-3.5rem)]">
            <Chat
              id={chatId}
              initialMessages={[]}
              selectedChatModel={DEFAULT_MODEL_NAME}
              selectedVisibilityType="private"
              isReadonly={false}
            />
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
} 