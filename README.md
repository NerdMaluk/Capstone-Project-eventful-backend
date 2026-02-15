Project Report: Eventful – Modern Event Ticketing Platform

# --- DATABASE CONFIGURATION ---
# Replace with your local PostgreSQL credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432eventful?schema=public"

# --- SERVER CONFIGURATION ---
PORT=3000
NODE_ENV=development

# --- SECURITY ---
JWT_SECRET="your_super_secret_random_key_here"

# --- CORS SETTINGS ---
# The URL where your React app is running
FRONTEND_URL="http://localhost:5173"

 Install dependencies: `npm install`
 Configure your `.env` file based on the provided template.
 Synchronize the database schema:
   ```bash
   npx prisma generate
   npx prisma db push

1. Executive Summary
   Eventful is a full-stack web application designed to streamline event management and ticket purchasing. The platform allows organizers to create events and enables users to discover and purchase tickets through a secure, automated system. The core value proposition is the seamless integration between payment processing and instant digital ticket issuance.

2. System Architecture
   The application is built using a modern, decoupled architecture to ensure scalability and maintainability.

2.1 Technology Stack
Frontend: React/Next.js (Tailwind CSS for styling).

Backend: NestJS (Node.js framework) providing a RESTful API.

Database: PostgreSQL/MySQL managed via Prisma ORM.

Authentication: JWT (JSON Web Tokens) with Passport.js strategy.

Payment Gateway: Paystack API.

DevOps/Tooling: Ngrok for webhook tunneling and Swagger for API documentation.

3. Core Modules & Features
   3.1 Authentication & Security
   JWT Implementation: Secure user sessions using Bearer tokens.

Role-Based Access: Differentiation between regular users and event organizers.

Bcrypt Encryption: Secure hashing for user passwords.

3.2 Event Management
CRUD operations for events (Create, Read, Update, Delete).

Real-time availability tracking for tickets.

Metadata management (Dates, Location, Pricing, Organizer info).

3.3 Payment & Automated Ticketing (The "Core" Engine)
The most critical part of the system is the Payment Webhook integration:

Asynchronous Processing: The system doesn't rely on the frontend to confirm a sale; it listens directly to the Paystack server.

Cryptographic Verification: Uses HMAC SHA512 to verify that incoming payment notifications are authentic.

Automated Fulfillment: Upon a charge.success event, the system automatically triggers the TicketsService to generate a unique ticket for the user.

4. Database Schema (Data Modeling)
   The database is structured to maintain referential integrity:

User: Stores profiles and authentication data.

Event: Contains event details, capacity, and pricing.

Ticket: Connects a User to an Event, storing a unique payment reference and the purchase price.

5. Technical Challenges & Overcoming Obstacles
   During development, several key challenges were addressed:

Webhook Tunneling: Solved using Ngrok to allow a local development server to receive real-time POST requests from the Paystack cloud.

Dependency Injection: Managed complex service interactions (e.g., PaymentsController requiring TicketsService) by structuring NestJS modules correctly.

Auth Bypass for Webhooks: Implemented a custom @Public() decorator to allow external payment notifications to bypass JWT security filters while maintaining overall system safety.

6. Conclusion
   The Eventful platform successfully demonstrates a production-ready approach to event ticketing. By automating the payment-to-issuance pipeline, the application reduces manual overhead and provides a reliable, secure experience for both organizers and attendees.
