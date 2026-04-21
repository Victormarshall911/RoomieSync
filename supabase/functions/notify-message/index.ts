import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    try {
        const payload = await req.json()
        const { record } = payload

        // 1. Initialize Supabase Client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Get the recipient of the message
        // We need to fetch the conversation to find the other user
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('user1_id, user2_id')
            .eq('id', record.conversation_id)
            .single()

        if (convError || !conversation) throw convError || new Error('Conversation not found')

        const recipientId = record.sender_id === conversation.user1_id
            ? conversation.user2_id
            : conversation.user1_id

        // 3. Get recipient's push token
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('push_token, full_name')
            .eq('id', recipientId)
            .single()

        if (profError || !profile?.push_token) {
            console.log('No push token found for recipient')
            return new Response('No push token', { status: 200 })
        }

        // 4. Send notification via Expo
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                to: profile.push_token,
                title: 'New Message',
                body: record.content.length > 50
                    ? record.content.substring(0, 47) + '...'
                    : record.content,
                data: { conversationId: record.conversation_id },
            }),
        })

        const result = await response.json()
        console.log('Push notification sent:', result)

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Error in notify-message function:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
