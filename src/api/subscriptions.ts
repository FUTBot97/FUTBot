import { supabase } from '../lib/supabase';

export const subscriptions = {
  // Check if a subscription is active
  async validateSubscription(email: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    
    if (!data) return { isActive: false };
    
    const isActive = data.expires_at ? new Date(data.expires_at) > new Date() : false;
    return { isActive, subscription: data };
  },

  // Generate activation token
  async generateActivation(email: string) {
    const token = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ token })
      .eq('email', email)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to real-time updates
  subscribeToUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('subscription_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        callback
      )
      .subscribe();
  }
};