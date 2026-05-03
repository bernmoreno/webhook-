// App.jsx — root component, mounts provider + dashboard
import { WebhookProvider } from './context/WebhookContext';
import Dashboard from './components/Dashboard';

const App = () => (
  <WebhookProvider>
    <Dashboard />
  </WebhookProvider>
);

export default App;
