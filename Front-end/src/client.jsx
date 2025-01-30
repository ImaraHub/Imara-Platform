import { createThirdwebClient } from "thirdweb";

// Access the environment variable directly (no type annotations needed in JSX)
const clientId = import.meta.env.VITE_CLIENT_ID;

console.log("Client ID:", clientId);

export const client = createThirdwebClient({
  clientId: clientId,
});