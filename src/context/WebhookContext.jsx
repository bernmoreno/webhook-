// WebhookContext.jsx — global state via Context API
import { createContext, useContext } from 'react';
import { useWebhooks } from '../hooks/useWebhooks';

const WebhookContext = createContext(null);

/**
 * Provides webhook state to the entire component tree.
 */
export const WebhookProvider = ({ children }) => {
  const webhookState = useWebhooks();
  return (
    <WebhookContext.Provider value={webhookState}>
      {children}
    </WebhookContext.Provider>
  );
};

/**
 * Consume webhook context — throws if used outside provider.
 */
export const useWebhookContext = () => {
  const ctx = useContext(WebhookContext);
  if (!ctx) throw new Error('useWebhookContext must be used inside <WebhookProvider>');
  return ctx;
};
