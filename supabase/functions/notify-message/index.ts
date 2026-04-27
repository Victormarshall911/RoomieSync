import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
    try {
        const payload = await req.json()
        const { record } = payload

        // 1. Validate record
        if (!record || !record.conversation_id || !record.sender_id || !record.content) {
            console.error('Invalid payload structure:', JSON.stringify(payload))
            return new Response(JSON.stringify({ error: 'Invalid payload: missing record or required fields' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2. Initialize Supabase Client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Get the recipient of the message
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('user1_id, user2_id')
            .eq('id', record.conversation_id)
            .single()

        if (convError) {
            console.error('Conversation fetch error:', convError)
            throw convError
        }
        if (!conversation) throw new Error('Conversation not found')

        const recipientId = record.sender_id === conversation.user1_id
            ? conversation.user2_id
            : conversation.user1_id

        if (!recipientId) throw new Error('Recipient not found in conversation')

        // 4. Get recipient's push token
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('push_token, full_name')
            .eq('id', recipientId)
            .single()

        if (profError) {
            console.error('Profile fetch error:', profError)
            throw profError
        }

        if (!profile?.push_token) {
            console.log('No push token found for recipient:', recipientId)
            return new Response(JSON.stringify({ message: 'No push token found' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 5. Send notification via Expo
        console.log(`Sending notification to ${profile.full_name} (${recipientId})`)
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

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Expo API error (${response.status}):`, errorText)
            throw new Error(`Expo API returned ${response.status}: ${errorText}`)
        }

        const result = await response.json()
        console.log('Push notification sent successfully:', result)

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        console.error('Error in notify-message function:', error.message || error)
        return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
