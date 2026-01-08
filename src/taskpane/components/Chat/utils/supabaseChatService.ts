import { supabase } from '../../../../integrations/supabase/client';

export interface SupabaseMessage {
    id: string;
    conversation_id: string;
    content: string;
    role: string;
    sources?: any;
    follow_up_questions?: any;
    sequence_number: number;
    created_at: string;
}

export interface SupabaseConversation {
    id: string;
    title: string;
    user_id: string;
    project_id?: string;
    document_session_id?: string;
    knowhub_project_id?: string;
    source?: string;
    created_at: string;
    updated_at: string;
    messages?: SupabaseMessage[];
}

/**
 * Creates a new conversation in the Supabase database.
 */
export async function createConversation(opts: {
    title: string;
    documentSessionId?: string;
    source?: string;
    userId: string;
}): Promise<SupabaseConversation> {
    const { data, error } = await supabase
        .from('conversations')
        .insert({
            title: opts.title,
            user_id: opts.userId,
            document_session_id: opts.documentSessionId,
            source: opts.source || 'word_plugin',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation in Supabase:', error);
        throw error;
    }

    return data as SupabaseConversation;
}

/**
 * Adds a message to an existing conversation in Supabase.
 */
export async function addMessage(params: {
    conversationId: string;
    role: string;
    content: string;
    sources?: any;
    followUpQuestions?: any;
}): Promise<SupabaseMessage> {
    // Get the latest sequence number
    const { data: lastMessage } = await supabase
        .from('messages')
        .select('sequence_number')
        .eq('conversation_id', params.conversationId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSequence = (lastMessage?.sequence_number || 0) + 1;

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: params.conversationId,
            content: params.content,
            role: params.role,
            sequence_number: nextSequence,
            sources: params.sources,
            follow_up_questions: params.followUpQuestions,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding message to Supabase:', error);
        throw error;
    }

    // Update the conversation's updated_at timestamp
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', params.conversationId);

    return data as SupabaseMessage;
}

/**
 * Fetches a conversation and its messages from Supabase.
 */
export async function getConversation(conversationId: string): Promise<SupabaseConversation | null> {
    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

    if (convError) {
        if (convError.code === 'PGRST116') return null;
        throw convError;
    }

    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sequence_number', { ascending: true });

    if (messagesError) {
        console.error('Error fetching messages from Supabase:', messagesError);
        return { ...conversation, messages: [] } as SupabaseConversation;
    }

    return { ...conversation, messages } as SupabaseConversation;
}

/**
 * Fetches the latest conversation for a given user.
 */
export async function getLatestConversation(userId: string): Promise<SupabaseConversation | null> {
    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (convError) {
        console.error('Error fetching latest conversation from Supabase:', convError);
        return null;
    }

    if (!conversation) return null;

    return await getConversation(conversation.id);
}
