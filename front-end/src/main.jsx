import { StrictMode } from 'react';
import  ReactDOM  from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { AuthProvider } from './AuthContext.jsx';

const clientId = import.meta.env.VITE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThirdwebProvider clientId={clientId}>
      <AuthProvider>
      <App />
      </AuthProvider>
    </ThirdwebProvider>
  </StrictMode>
);