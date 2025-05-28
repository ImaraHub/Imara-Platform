# Imara Platform

A decentralized platform for project management, team collaboration, and milestone tracking.

## Features

- Web3 wallet authentication
- Project creation and management
- Team formation and matching
- Milestone tracking and validation
- Staking mechanism
- Reputation system

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or any Web3 wallet
- Supabase account
- Git

## Tech Stack

- Frontend: React.js with Vite
- Backend: Node.js with Express
- Database: Supabase (PostgreSQL)
- Smart Contracts: Solidity
- Authentication: Web3, JWT
- Storage: Supabase Storage

## Project Structure

```
imara-platform/
├── front-end/          # React frontend application
├── backend/           # Node.js backend server
├── contracts/         # Solidity smart contracts
└── docs/             # Documentation
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/imara-platform.git
cd imara-platform
```

### 2. Set Up Supabase

1. Create a new project in [Supabase](https://supabase.com)
2. Copy your project URL and anon key
3. Run the SQL commands from `backend/docs/db.md` in the Supabase SQL editor
4. Create the following storage buckets:
   - avatars
   - project-images
   - team-images

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-secret-key

# Smart Contract Addresses
MILESTONE_CONTRACT_ADDRESS=your-contract-address
STAKING_CONTRACT_ADDRESS=your-contract-address
TOKEN_FACTORY_CONTRACT_ADDRESS=your-contract-address

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

### 4. Frontend Setup

```bash
cd front-end

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Update `.env` with your configuration:
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Smart Contract Setup

```bash
cd contracts

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Update `.env` with your configuration:
```env
PRIVATE_KEY=your-wallet-private-key
INFURA_API_KEY=your-infura-api-key
```

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start at `http://localhost:3001`

### 2. Start the Frontend Development Server

```bash
cd front-end
npm run dev
```

The frontend application will start at `http://localhost:5173`

### 3. Deploy Smart Contracts (Optional)

```bash
cd contracts
npx hardhat run scripts/deploy.js --network <network-name>
```

## Development Workflow

1. Make sure both backend and frontend servers are running
2. Connect your Web3 wallet to the application
3. Create a user profile
4. Start creating projects or joining teams

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd front-end
npm test
```

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@imara-platform.com or join our Discord community.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Supabase for backend infrastructure
- React team for the amazing frontend framework

