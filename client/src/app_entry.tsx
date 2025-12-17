// file: client/src/app_entry.tsx
// description: Client entry point wrapping the app with shared providers
// reference: client/src/providers/client_providers.tsx, client/src/App.tsx

'use client';

import App from './App';
import { ClientProviders } from './providers/client_providers';

function AppEntry() {
  return (
    <ClientProviders>
      <App />
    </ClientProviders>
  );
}

export default AppEntry;
