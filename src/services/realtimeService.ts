
// Realtime Service completely disabled (no Supabase backend)

// Define types for callback functions
export type RealtimeCallbackFn<T = any> = (payload: T) => void;

export const realtimeService = {
  // All methods now return no-op functions
  activeSubscriptions: new Map<string, () => void>(),

  // Disabled - no realtime functionality
  subscribeToCountries(callback: RealtimeCallbackFn): () => void {
    console.log('Realtime service disabled - no subscriptions created');
    return () => {};
  },

  // Disabled - no realtime functionality  
  subscribeToDepartments(callback: RealtimeCallbackFn): () => void {
    console.log('Realtime service disabled - no subscriptions created');
    return () => {};
  },

  // Disabled - no realtime functionality
  subscribeToDocumentTypes(callback: RealtimeCallbackFn): () => void {
    console.log('Realtime service disabled - no subscriptions created');
    return () => {};
  },

  // Disabled - no realtime functionality
  subscribeToDocumentNames(callback: RealtimeCallbackFn): () => void {
    console.log('Realtime service disabled - no subscriptions created');
    return () => {};
  },

  // Disabled - no realtime functionality
  subscribeToTable(tableName: string, callback: RealtimeCallbackFn): () => void {
    console.log(`Realtime service disabled - no subscription to ${tableName}`);
    return () => {};
  },

  // Disabled - no realtime functionality
  async enableRealtimeForTable(tableName: string): Promise<boolean> {
    console.log(`Realtime service disabled - cannot enable for ${tableName}`);
    return false;
  },
  
  // Disabled - no realtime functionality
  async testRealtimeConnection(): Promise<boolean> {
    console.log('Realtime service disabled - no connection test');
    return false;
  }
};
