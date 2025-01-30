import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThirdwebProvider } from "@thirdweb-dev/react"; 
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
console.log(queryClient);

createRoot(document.getElementById("root")).render(
  <StrictMode>
     <QueryClientProvider client={queryClient}>
      {/* Wrap the app with QueryClientProvider and pass the queryClient */}
      <ThirdwebProvider clientId={import.meta.env.VITE_CLIENT_ID}>
        <App />
      </ThirdwebProvider>
    </QueryClientProvider>
  </StrictMode>
);
