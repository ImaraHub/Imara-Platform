import { StrictMode } from 'react';
import  ReactDOM  from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { AuthProvider } from './AuthContext.jsx';
import { ConfigProvider } from './ConfigContext';

fetch('/config.json')
  .then((res) => res.json())
  .then((config) => {
    const clientId = config.THIRDWEB_CLIENT_ID;

    ReactDOM.createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ThirdwebProvider clientId={clientId}>
          <ConfigProvider config={config}>
            <AuthProvider >
              <App />
            </AuthProvider>
           </ConfigProvider>
        </ThirdwebProvider>
      </StrictMode>
    );
  })
  .catch((err) => {
    console.error('Failed to load config.json', err);
    document.getElementById('root').textContent =
      'Failed to load configuration.';
  });