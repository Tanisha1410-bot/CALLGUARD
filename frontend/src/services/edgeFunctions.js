import { supabase } from '../supabaseClient';

/**
 * Invoke the deployed 'callguard-ai' Supabase Edge Function.
 *
 * @param {Object} payload – the JSON body to send to the function
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
export async function invokeCallGuardAI(payload) {
  try {
    const { data, error } = await supabase.functions.invoke('callguard-ai', {
      body: payload,
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('[CallGuard Edge Function Error]', err);
    return {
      success: false,
      error: err?.message || 'Unknown error calling callguard-ai',
    };
  }
}
