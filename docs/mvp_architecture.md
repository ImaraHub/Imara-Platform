# MVP System Architecture: Dual-Sided Web3 Innovation Platform

## Architecture Philosophy

**Design Principles:**
- **Start Simple, Scale Smart**: Monolith-first approach with microservices boundaries clearly defined
- **Multi-Tenant from Day 1**: Built-in tenant isolation without over-engineering
- **Web3-First**: Native blockchain integration, not bolted on
- **Progressive Enhancement**: Core features work without Web3, enhanced features require it
- **Cost-Conscious**: Optimize for low operational costs during MVP phase

## High-Level Architecture Overview

```
Frontend Layer (React SPA)
    ↓
API Gateway (Express.js + Middleware)
    ↓
Core Services (Modular Monolith)
    ↓
Data Layer (PostgreSQL + Redis + IPFS)
    ↓
Blockchain Layer (ThirdWeb + Custom Contracts)
```

## Detailed System Components

### 1. Frontend Architecture

#### Core React Application
```
src/
├── apps/
│   ├── individual-platform/    # Individual user interface
│   ├── organization-platform/  # Organization admin interface  
│   └── shared-components/      # Reusable UI components
├── libs/
│   ├── auth/                   # Authentication logic
│   ├── web3/                   # Blockchain interactions
│   ├── api/                    # API client layer
│   └── utils/                  # Shared utilities
└── contexts/
    ├── TenantContext           # Multi-tenant state
    ├── Web3Context            # Blockchain state
    └── UserContext            # User session state
```

**Key Features:**
- **Tenant-Aware Routing**: Dynamic routing based on subdomain/path
- **Progressive Web App**: Service workers for offline functionality
- **State Management**: Zustand for lightweight state management
- **Web3 Integration**: ThirdWeb React SDK for wallet connections
- **Real-time Updates**: Socket.io client for live updates

#### Multi-Tenant Frontend Strategy
```typescript
// Tenant detection and routing
const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  
  useEffect(() => {
    // Detect tenant from subdomain or path
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    if (subdomain !== 'www' && subdomain !== 'app') {
      setTenant({ type: 'organization', slug: subdomain });
    } else {
      setTenant({ type: 'platform', slug: null });
    }
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};
```

### 2. Backend Architecture (Node.js + Express)

#### Modular Monolith Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/               # Authentication & authorization
│   │   ├── users/              # User management
│   │   ├── organizations/      # Organization management
│   │   ├── projects/           # Project CRUD operations
│   │   ├── milestones/         # Milestone tracking
│   │   ├── events/             # Event/hackathon management
│   │   ├── web3/               # Blockchain interactions
│   │   └── notifications/      # Real-time notifications
│   ├── shared/
│   │   ├── middleware/         # Common middleware
│   │   ├── utils/              # Shared utilities
│   │   ├── types/              # TypeScript types
│   │   └── constants/          # Application constants
│   ├── database/
│   │   ├── migrations/         # Database migrations
│   │   ├── seeds/              # Test data
│   │   └── models/             # Database models
│   └── config/
│       ├── database.ts         # DB configuration
│       ├── web3.ts             # Blockchain config
│       └── environment.ts      # Environment variables
├── tests/
└── docs/
```

#### Core API Gateway & Middleware Stack
```typescript
// Multi-tenant middleware
const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract tenant from subdomain or header
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
      // Organization tenant
      const org = await Organization.findOne({ slug: subdomain });
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      req.tenant = { type: 'organization', data: org };
    } else {
      // Platform tenant
      req.tenant = { type: 'platform', data: null };
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Tenant resolution failed' });
  }
};

// Rate limiting per tenant
const rateLimitMiddleware = rateLimit({
  keyGenerator: (req) => `${req.tenant?.data?.id || 'platform'}:${req.ip}`,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => req.tenant?.type === 'organization' ? 1000 : 100
});
```

### 3. Database Architecture

#### PostgreSQL Schema Design
```sql
-- Multi-tenant database schema

-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (Global with tenant associations)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  wallet_address VARCHAR(42),
  github_id VARCHAR(50),
  profile_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization memberships (Many-to-many)
CREATE TABLE organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Projects (Tenant-scoped)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  creator_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  stage VARCHAR(50) DEFAULT 'ideation',
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  completion_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events/Hackathons (Organization-specific)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  registration_deadline TIMESTAMP,
  settings JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blockchain transactions (for audit trail)
CREATE TABLE blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  transaction_hash VARCHAR(66),
  transaction_type VARCHAR(50),
  amount DECIMAL(18,8),
  token_symbol VARCHAR(10),
  status VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Redis Caching Strategy
```typescript
// Cache configuration
const cacheConfig = {
  // User sessions
  sessions: { ttl: 24 * 60 * 60 }, // 24 hours
  
  // Project data
  projects: { ttl: 10 * 60 }, // 10 minutes
  
  // Organization settings
  organizations: { ttl: 60 * 60 }, // 1 hour
  
  // Blockchain data
  tokenPrices: { ttl: 5 * 60 }, // 5 minutes
  walletBalances: { ttl: 2 * 60 }, // 2 minutes
  
  // Real-time data
  activeUsers: { ttl: 30 }, // 30 seconds
  notifications: { ttl: 15 * 60 } // 15 minutes
};
```

### 4. Web3 Integration Layer

#### Smart Contract Architecture
```solidity
// ProjectStaking.sol - Core staking contract
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectStaking is ReentrancyGuard, Ownable {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    struct Project {
        string projectId; // Links to off-chain project data
        address creator;
        uint256 totalStaked;
        bool active;
        mapping(address => Stake) stakes;
    }
    
    mapping(string => Project) public projects;
    IERC20 public stakingToken;
    
    event ProjectCreated(string indexed projectId, address creator);
    event Staked(string indexed projectId, address staker, uint256 amount);
    event Unstaked(string indexed projectId, address staker, uint256 amount);
    
    function createProject(string memory projectId) external {
        require(projects[projectId].creator == address(0), "Project exists");
        
        projects[projectId].projectId = projectId;
        projects[projectId].creator = msg.sender;
        projects[projectId].active = true;
        
        emit ProjectCreated(projectId, msg.sender);
    }
    
    function stakeOnProject(string memory projectId, uint256 amount) 
        external 
        nonReentrant 
    {
        require(projects[projectId].active, "Project not active");
        require(amount > 0, "Amount must be positive");
        
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        projects[projectId].stakes[msg.sender].amount += amount;
        projects[projectId].stakes[msg.sender].timestamp = block.timestamp;
        projects[projectId].stakes[msg.sender].active = true;
        projects[projectId].totalStaked += amount;
        
        emit Staked(projectId, msg.sender, amount);
    }
    
    // Additional functions for unstaking, rewards, etc.
}
```

#### Web3 Service Layer
```typescript
// web3Service.ts
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

class Web3Service {
  private sdk: ThirdwebSDK;
  private stakingContract: any;
  
  constructor() {
    this.sdk = new ThirdwebSDK("ethereum");
    this.initializeContracts();
  }
  
  async initializeContracts() {
    this.stakingContract = await this.sdk.getContract(
      process.env.STAKING_CONTRACT_ADDRESS
    );
  }
  
  async createProject(projectId: string, creatorAddress: string) {
    try {
      const tx = await this.stakingContract.call("createProject", [projectId]);
      return tx.receipt.transactionHash;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }
  
  async stakeOnProject(projectId: string, amount: string, userAddress: string) {
    try {
      const tx = await this.stakingContract.call("stakeOnProject", [
        projectId,
        ethers.utils.parseEther(amount)
      ]);
      return tx.receipt.transactionHash;
    } catch (error) {
      throw new Error(`Failed to stake: ${error.message}`);
    }
  }
  
  async getProjectStakingInfo(projectId: string) {
    try {
      const project = await this.stakingContract.call("projects", [projectId]);
      return {
        creator: project.creator,
        totalStaked: ethers.utils.formatEther(project.totalStaked),
        active: project.active
      };
    } catch (error) {
      throw new Error(`Failed to get project info: ${error.message}`);
    }
  }
}

export const web3Service = new Web3Service();
```

### 5. Real-time Communication

#### WebSocket Architecture with Socket.io
```typescript
// socketService.ts
import { Server } from 'socket.io';
import { authenticateSocket } from './middleware/auth';

class SocketService {
  private io: Server;
  
  constructor(server: any) {
    this.io = new Server(server, {
      cors: { origin: process.env.FRONTEND_URL }
    });
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }
  
  private setupMiddleware() {
    this.io.use(authenticateSocket);
    
    // Tenant-aware room joining
    this.io.use((socket, next) => {
      const tenant = socket.handshake.auth.tenant;
      if (tenant?.type === 'organization') {
        socket.join(`org:${tenant.slug}`);
      }
      socket.join('platform');
      next();
    });
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      // Project-specific rooms
      socket.on('join-project', (projectId) => {
        socket.join(`project:${projectId}`);
      });
      
      // Real-time milestone updates
      socket.on('milestone-update', (data) => {
        socket.to(`project:${data.projectId}`).emit('milestone-updated', data);
      });
      
      // Live collaboration features
      socket.on('project-edit', (data) => {
        socket.to(`project:${data.projectId}`).emit('project-changed', data);
      });
    });
  }
  
  // Broadcast methods
  notifyProjectUpdate(projectId: string, update: any) {
    this.io.to(`project:${projectId}`).emit('project-update', update);
  }
  
  notifyOrganization(orgSlug: string, notification: any) {
    this.io.to(`org:${orgSlug}`).emit('notification', notification);
  }
}
```

### 6. File Storage & IPFS Integration

#### Hybrid Storage Strategy
```typescript
// storageService.ts
import { create as ipfsCreate } from 'ipfs-http-client';
import AWS from 'aws-sdk';

class StorageService {
  private ipfs: any;
  private s3: AWS.S3;
  
  constructor() {
    // IPFS for decentralized storage
    this.ipfs = ipfsCreate({ 
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https'
    });
    
    // AWS S3 for reliable file storage
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }
  
  async uploadFile(file: Buffer, filename: string, type: 'public' | 'private' = 'public') {
    if (type === 'public') {
      // Use IPFS for public, immutable content
      const result = await this.ipfs.add(file);
      return {
        hash: result.path,
        url: `https://ipfs.io/ipfs/${result.path}`,
        storage: 'ipfs'
      };
    } else {
      // Use S3 for private/organizational content
      const key = `uploads/${Date.now()}-${filename}`;
      const uploadResult = await this.s3.upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: file,
        ContentType: 'application/octet-stream'
      }).promise();
      
      return {
        key: key,
        url: uploadResult.Location,
        storage: 's3'
      };
    }
  }
  
  async getSignedUrl(key: string, expires: number = 3600) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Expires: expires
    });
  }
}

export const storageService = new StorageService();
```

### 7. Authentication & Authorization

#### Multi-Modal Auth System
```typescript
// authService.ts
import { createClient } from '@supabase/supabase-js';
import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import jwt from 'jsonwebtoken';

class AuthService {
  private supabase: any;
  private thirdwebAuth: any;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    this.thirdwebAuth = ThirdwebAuth({
      domain: process.env.THIRDWEB_AUTH_DOMAIN!,
      wallet: ThirdwebSDK.fromPrivateKey(
        process.env.THIRDWEB_AUTH_PRIVATE_KEY!,
        "ethereum"
      ),
    });
  }
  
  async authenticateUser(method: 'email' | 'github' | 'wallet', credentials: any) {
    switch (method) {
      case 'email':
        return await this.emailAuth(credentials);
      case 'github':
        return await this.githubAuth(credentials);
      case 'wallet':
        return await this.walletAuth(credentials);
      default:
        throw new Error('Invalid authentication method');
    }
  }
  
  private async emailAuth({ email, password }: any) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return this.createUnifiedSession(data.user, 'email');
  }
  
  private async walletAuth({ signature, message, address }: any) {
    const user = await this.thirdwebAuth.verify({ signature, message });
    if (!user) throw new Error('Invalid signature');
    
    return this.createUnifiedSession({ wallet_address: address }, 'wallet');
  }
  
  private async createUnifiedSession(userData: any, authMethod: string) {
    // Create or update user in our database
    const user = await this.findOrCreateUser(userData, authMethod);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, authMethod },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    return { user, token };
  }
}
```

## Deployment & Infrastructure

### Development Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/platform_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: platform_dev
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
volumes:
  postgres_data:
```

### Production Deployment (Vercel + Railway)
```typescript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.yourplatform.com/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "SUPABASE_URL": "@supabase-url"
  }
}
```

## MVP Feature Prioritization

### Phase 1: Core MVP (Weeks 1-8)
**Individual Platform:**
- User registration/authentication (email, GitHub, wallet)
- Basic project creation and management
- Simple milestone tracking
- Project discovery and filtering
- Basic staking functionality

**Organization Platform:**
- Organization onboarding
- Event/hackathon creation
- Basic participant management
- Simple analytics dashboard

### Phase 2: Enhanced MVP (Weeks 9-16)
- Real-time collaboration features
- Advanced project search and matching
- Comprehensive milestone tracking
- Basic notification system
- Payment integration for organizations

### Phase 3: Production Ready (Weeks 17-24)
- Advanced analytics and reporting
- Mobile-responsive design
- Performance optimization
- Security hardening
- Comprehensive testing suite

## Monitoring & Observability

### Application Monitoring
```typescript
// monitoring.ts
import { createPrometheusMetrics } from 'prom-client';

export const metrics = {
  httpRequests: new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status', 'tenant']
  }),
  
  activeUsers: new prometheus.Gauge({
    name: 'active_users_total',
    help: 'Total active users',
    labelNames: ['tenant', 'user_type']
  }),
  
  blockchainTransactions: new prometheus.Counter({
    name: 'blockchain_transactions_total',
    help: 'Total blockchain transactions',
    labelNames: ['type', 'status']
  })
};
```

This architecture provides a solid foundation for your MVP while maintaining clear paths for scaling to a full microservices architecture as you grow. The multi-tenant design is built-in from day one, and the Web3 integration is native rather than bolted on.