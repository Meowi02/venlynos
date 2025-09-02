// Realtime seam for future WebSocket integration

export type RealtimeEvent = 
  | { type: 'call.created'; data: { id: string; workspaceId: string; [key: string]: any } }
  | { type: 'call.updated'; data: { id: string; workspaceId: string; [key: string]: any } }
  | { type: 'job.created'; data: { id: string; workspaceId: string; [key: string]: any } }
  | { type: 'job.updated'; data: { id: string; workspaceId: string; [key: string]: any } }
  | { type: 'job.status_changed'; data: { id: string; workspaceId: string; status: string; [key: string]: any } };

export type EventCallback = (event: RealtimeEvent) => void;

class RealtimeManager {
  private subscriptions = new Map<string, Set<EventCallback>>();
  private connected = false;

  // Subscribe to events for a topic (e.g., workspace ID)
  subscribe(topic: string, callback: EventCallback): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    
    this.subscriptions.get(topic)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(topic);
        }
      }
    };
  }

  // Publish event (mock implementation for development)
  publish(topic: string, event: RealtimeEvent): void {
    console.log('📡 [Realtime] Publishing event:', event.type, 'to topic:', topic);
    
    const callbacks = this.subscriptions.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('📡 [Realtime] Error in event callback:', error);
        }
      });
    }
  }

  // Mock connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Mock connect (in real implementation, this would establish WebSocket)
  connect(): void {
    console.log('📡 [Realtime] Connecting... (mock)');
    this.connected = true;
  }

  // Mock disconnect
  disconnect(): void {
    console.log('📡 [Realtime] Disconnecting... (mock)');
    this.connected = false;
    this.subscriptions.clear();
  }
}

// Global instance
const realtime = new RealtimeManager();

// Auto-connect in development
if (typeof window !== 'undefined') {
  realtime.connect();
}

export { realtime };

// Convenience hooks for React components
export function useRealtimeSubscription(
  topic: string, 
  callback: EventCallback, 
  deps: React.DependencyList = []
) {
  if (typeof window === 'undefined') return;
  
  // This would be a proper React hook in a real implementation
  // For now, it's just a utility function
  React.useEffect(() => {
    const unsubscribe = realtime.subscribe(topic, callback);
    return unsubscribe;
  }, deps);
}

// Simulated live updates for development
export function simulateLiveUpdate(workspaceId: string) {
  // This is just for demo purposes - simulates receiving live updates
  const eventTypes: RealtimeEvent['type'][] = [
    'call.created', 'call.updated', 'job.created', 'job.updated', 'job.status_changed'
  ];
  
  const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const mockId = `mock_${Date.now()}`;
  
  realtime.publish(workspaceId, {
    type: randomEvent,
    data: {
      id: mockId,
      workspaceId,
      timestamp: new Date().toISOString(),
      // Add more mock data based on event type
      ...(randomEvent.includes('job') && { title: 'New Service Call', status: 'new' }),
      ...(randomEvent.includes('call') && { direction: 'in', disposition: 'answered' }),
    },
  });
}

// Helper to publish events from API routes
export function publishRealtimeEvent(workspaceId: string, event: RealtimeEvent) {
  realtime.publish(workspaceId, event);
}

export default realtime;