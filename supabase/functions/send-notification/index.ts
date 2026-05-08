// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

// @ts-ignore
serve(async (req: any) => {
  try {
    const payload = await req.json()
    const { record } = payload
    
    // 1. Initialize Supabase client
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Get the conversation to find the recipient
    const { data: conversation, error: convoError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', record.conversation_id)
      .single()

    if (convoError || !conversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 })
    }

    // 3. Determine recipient ID (the one who isn't the sender)
    const recipientId = record.sender_id === conversation.user1_id 
      ? conversation.user2_id 
      : conversation.user1_id

    // 4. Get recipient's push token and name of sender
    const [recipientRes, senderRes] = await Promise.all([
      supabase.from('profiles').select('push_token, full_name').eq('id', recipientId).single(),
      supabase.from('profiles').select('full_name').eq('id', record.sender_id).single()
    ])

    const pushToken = recipientRes.data?.push_token
    const senderName = senderRes.data?.full_name || 'Someone'

    if (!pushToken) {
      return new Response(JSON.stringify({ message: 'No push token for recipient' }), { status: 200 })
    }

    // 5. Send notification to Expo
    const message = {
      to: pushToken,
      sound: 'default',
      title: `New message from ${senderName}`,
      body: record.content,
      data: { 
        type: 'chat',
        conversationId: record.conversation_id,
        senderId: record.sender_id
      },
    }

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    const err = error as Error;
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    })
  }
})
