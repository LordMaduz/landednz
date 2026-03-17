# LandedNZ
**Intelligent Settlement Platform for Skilled Migrants in New Zealand**

[![Development Status](https://img.shields.io/badge/Status-MVP%20Development-orange)](https://github.com/yourusername/landednz)
[![Phase](https://img.shields.io/badge/Phase-4%20AI%20Chat-blue)](#development-roadmap)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20Native%20%7C%20Node.js%20%7C%20PostgreSQL-green)](#tech-stack)

---

## Overview

LandedNZ is a comprehensive settlement platform designed to help skilled migrants navigate their first 90 days in New Zealand. The platform provides personalized task prioritization, AI-powered settlement advisory, and contextual guidance tailored to individual circumstances.

### Key Problems Solved
- **Information Overload**: Streamlines 100+ settlement tasks into a personalized priority roadmap
- **Context Switching**: Provides situation-aware guidance based on visa type, family situation, and location
- **Timing Confusion**: Delivers time-sensitive task sequencing with consequence awareness
- **Support Gaps**: Offers 24/7 AI advisory for settlement questions and challenges

## Key Features

### 🎯 **Personalized Roadmap Engine**
- Dynamic task prioritization based on user profile
- Dependency-aware sequencing (e.g., IRD before bank account)
- Real-time progress tracking and completion validation

### 🤖 **AI Settlement Advisor**
- Context-aware chat assistance powered by Claude AI
- 7-component system prompt with user profile injection
- Real-time streaming responses with guardrails

### 📱 **Mobile-First Experience**
- Native React Native application for iOS and Android
- Offline-capable task management
- Push notifications for time-sensitive tasks

### 🔐 **Secure & Premium**
- Supabase authentication with JWT validation
- Subscription-based premium features
- GDPR-compliant data handling

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Native App] --> B[Navigation & State]
        B --> C[Onboarding Flow]
        B --> D[Roadmap Dashboard]
        B --> E[AI Chat Interface]
    end

    subgraph "API Gateway"
        F[Fastify REST API]
        F --> G[Authentication Middleware]
        F --> H[Error Handling]
    end

    subgraph "Core Services"
        I[Roadmap Engine] --> J[Priority Scoring]
        I --> K[Dependency Resolution]
        L[Chat Service] --> M[System Prompt Builder]
        L --> N[Streaming Pipeline]
        L --> O[Guardrails Engine]
    end

    subgraph "Data Layer"
        P[(PostgreSQL + pgvector)]
        Q[Supabase Auth]
        R[Knowledge Base]
    end

    subgraph "External Services"
        S[Claude AI API]
        T[RevenueCat Subscriptions]
        U[Email Service]
    end

    A --> F
    I --> P
    L --> P
    L --> S
    F --> Q
    F --> T
    F --> U
    N --> R
```

## Tech Stack

### **Frontend**
- **React Native CLI** - Native mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation management
- **React Native Paper** - Material Design components

### **Backend**
- **Node.js + Fastify** - High-performance web framework
- **TypeScript** - Full-stack type safety
- **Prisma ORM** - Database abstraction with migrations
- **PostgreSQL** - Primary database with pgvector for embeddings

### **AI & Analytics**
- **Claude API (Anthropic)** - Advanced language model integration
- **pgvector** - Vector similarity search for knowledge base
- **Real-time streaming** - SSE (Server-Sent Events) for chat

### **Infrastructure**
- **Supabase** - Authentication and real-time features
- **RevenueCat** - Subscription management
- **Docker** - Containerized development
- **Railway/Vercel** - Cloud deployment (planned)

## Development Status

### **Current Phase: Phase 4 - AI Chat Basic** 🚧
**Target Completion**: Q2 2026 | **Progress**: 25% Complete

#### ✅ Recently Completed
- **AC-4-01**: Chat session creation with entry-point awareness
- **AC-4-02**: SSE streaming pipeline with real-time responses
- **AC-4-13**: Premium subscription gate for chat features

#### 🔄 In Progress
- **AC-4-03**: System prompt component architecture
- **AC-4-04**: Level 1 input guardrails (crisis detection, prompt injection)
- **AC-4-05**: Level 2 output validation and logging

#### 📋 Next Up
- **AC-4-06-09**: Conversation history and context management
- **AC-4-10-15**: Error handling and user experience polish

### **Upcoming Phases**
- **Phase 5**: RAG + Launch (Q3 2026) - Advanced knowledge base integration
- **Phase 6**: Analytics & Optimization (Q4 2026) - User behavior insights
- **Phase 7**: Marketplace Integration (Q1 2027) - Third-party services

## Getting Started

### **Prerequisites**
- **Node.js** 22 LTS or higher
- **Docker** and Docker Compose
- **Git** version control
- **iOS Simulator** (macOS) or **Android Studio** (cross-platform)

### **Local Development Setup**

#### 1. **Clone and Install Dependencies**
```bash
git clone https://github.com/yourusername/landednz.git
cd landednz

# Install dependencies for all packages
npm install
cd apps/api && npm install
cd ../mobile && npm install
```

#### 2. **Database Setup**
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run database migrations
cd apps/api
npx prisma migrate dev
npx prisma generate
```

#### 3. **Supabase Setup**
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Start local Supabase stack
supabase start

# Note the API URL and keys from output
```

#### 4. **Environment Configuration**
```bash
# Copy environment templates
cp apps/api/.env.example apps/api/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# Configure required variables (see Configuration section)
```

#### 5. **Start Development Servers**
```bash
# Terminal 1: API Server
cd apps/api
npm run dev

# Terminal 2: Mobile App
cd apps/mobile
npm run ios    # or npm run android
```

### **Docker Development**

#### **Full Stack with Docker Compose**
```bash
# Start all services
docker-compose up

# Services available:
# - API: http://localhost:3000
# - PostgreSQL: localhost:5432
# - Supabase: http://localhost:54321
```

#### **Database Only**
```bash
# For hybrid development (Docker DB + local services)
docker-compose up postgres
```

## API Documentation

### **Base URL**
- **Development**: `http://localhost:3000`
- **Production**: `https://api.landednz.com` (planned)

### **Authentication**
All protected endpoints require JWT token in Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### **Core Endpoints**

#### **Roadmap Management**
```http
POST   /roadmap/initialize    # Create personalized roadmap
GET    /roadmap               # Get user's current roadmap
PUT    /roadmap/tasks/:id     # Update task status
DELETE /roadmap/reset         # Reset roadmap (dev only)
```

#### **Chat System**
```http
POST   /chat/sessions                           # Create chat session
POST   /chat/sessions/:sessionId/messages       # Send message (SSE stream)
GET    /chat/sessions/:sessionId/history        # Get conversation history
```

#### **User Management**
```http
GET    /users/profile         # Get user profile
PUT    /users/profile         # Update profile
POST   /users/onboarding      # Complete onboarding flow
```

### **Example API Usage**

#### **Create Chat Session**
```http
POST /chat/sessions
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "entryPoint": "TASK_CARD",
  "taskContext": "T08"
}
```

**Response:**
```json
{
  "sessionId": "uuid-here",
  "openingMessage": "You're looking at the IRD number task. I know you're a constrained couple in Auckland. What would you like to know?"
}
```

#### **Send Chat Message (SSE)**
```http
POST /chat/sessions/{sessionId}/messages
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "content": "What documents do I need for my IRD application?"
}
```

**SSE Response Stream:**
```
data: {"type": "chunk", "text": "For your IRD application"}
data: {"type": "chunk", "text": ", you'll need these documents:"}
data: {"type": "chunk", "text": "\n\n1. Passport with NZ visa"}
data: {"type": "done"}
```

## Project Structure

```
landednz/
├── apps/
│   ├── api/                 # Fastify backend service
│   │   ├── src/
│   │   │   ├── features/    # Feature-based modules
│   │   │   │   ├── roadmap/ # Job A: Roadmap engine
│   │   │   │   ├── chat/    # Job B: AI chat advisor
│   │   │   │   └── auth/    # Authentication
│   │   │   ├── core/        # Pure business logic
│   │   │   └── shared/      # Database, config, utilities
│   │   └── prisma/          # Database schema & migrations
│   └── mobile/              # React Native application
│       ├── src/
│       │   ├── screens/     # App screens
│       │   ├── components/  # Reusable components
│       │   └── services/    # API integration
│       └── ios/android/     # Platform-specific code
├── packages/
│   └── types/               # Shared TypeScript types
├── emails/                  # React Email templates
└── docs/                    # Documentation & setup guides
```

## Environment Configuration

### **API Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/landednz

# Supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_JWT_SECRET=your-jwt-secret-here

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4-6

# Subscriptions
REVENUECAT_API_KEY=your-revenuecat-key
REVENUECAT_WEBHOOK_SECRET=your-webhook-secret

# Email
RESEND_API_KEY=your-resend-key
```

### **Mobile Environment Variables**
```bash
# API Configuration
API_URL=http://localhost:3000

# Supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key

# RevenueCat
REVENUECAT_API_KEY=your-mobile-revenuecat-key
```

## Testing

### **API Testing**
```bash
cd apps/api

# Run all tests
npm test

# Run specific test suites
npm test -- src/features/roadmap
npm test -- src/features/chat

# Run with coverage
npm run test:coverage
```

### **Mobile Testing**
```bash
cd apps/mobile

# Run unit tests
npm test

# Run E2E tests (requires simulator)
npm run test:e2e:ios
npm run test:e2e:android
```

### **Integration Testing**
- All API endpoints tested with real database connections
- Authentication tested with actual Supabase JWT tokens
- AI chat tested with real Claude API responses (when credits available)

## Performance & Scaling

### **Current Specifications**
- **API Response Time**: <200ms for roadmap operations
- **Chat Streaming**: Real-time SSE with <100ms first chunk
- **Database Queries**: Optimized with proper indexing
- **Mobile Performance**: 60fps animations, <3s cold start

### **Scaling Considerations**
- Horizontal API scaling with stateless design
- Database connection pooling with Prisma
- CDN-ready for static assets
- Subscription-based usage limiting

## Security & Compliance

### **Data Protection**
- **Encryption**: All data encrypted in transit (TLS) and at rest
- **Authentication**: JWT-based with Supabase security
- **Input Validation**: Comprehensive request validation with Fastify schemas
- **Rate Limiting**: API rate limiting to prevent abuse

### **AI Safety**
- **Input Guardrails**: Crisis detection, prompt injection prevention
- **Output Validation**: Content filtering and source citation requirements
- **Usage Monitoring**: Comprehensive logging for audit trails

## License & Contact

### **License**
This is proprietary software. All rights reserved.

**LandedNZ** © 2026 - Unauthorized copying, modification, or distribution is prohibited.

### **Contact Information**
- **Product Owner**: [Your Name]
- **Technical Lead**: [Technical Lead Name]
- **Business Inquiries**: business@landednz.com
- **Technical Support**: support@landednz.com

### **Support Channels**
- 📧 **Email Support**: Available for subscribers
- 📱 **In-App Support**: Integrated help system
- 🐛 **Bug Reports**: Internal tracking system

---

**Built with ❤️ for skilled migrants starting their New Zealand journey**