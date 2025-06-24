# ZeroKnowledge-Attest

A Node.js API for attesting or notarizing documents with **zero-knowledge proof-based verification**, providing secure, privacy-preserving, and auditable document authenticity checks.
The system features **Public Verification**, **usage-limited verification tokens**, **JWT authentication** and **detailed audit logging**.

## Features

* **Zero-Knowledge Document Verification**: Authenticate documents without revealing their content
* **JWT Authentication**: Secure login and authorization for all endpoints
* **Comprehensive Document Management**: Upload, update, retrieve, and delete documents
* **Usage-Limited Verification Tokens**: Share verification rights with limited uses
* **Detailed Audit Logging**: All critical actions and verifications are logged
* **Public Verification API**: Third-party verification with tokens

## Technology Stack

* **Backend**: Node.js and Express.js
* **Database**: MongoDB
* **Authentication**: JSON Web Tokens (JWT)
* **Security**: Zero-Knowledge Proof cryptography

## 📸 Some Postman API Previews

### POST /api/auth/login [User Login]

![User Login](assets-postman/2.%20user%20login.png)

---

### POST /api/documents [Upload Document]

![Upload Document](assets-postman/3.%20post%20document%20API%20endpoint.png)

---

### POST /api/tokens [Generate Verification Token and Set Usage Limit]

![Generate Verification Token](assets-postman/6.%20generate%20token%20for%20the%20specific%20document%20ID.png)

---

### POST /api/public/verify [Public Verification of Attested Documents]

![Public Verification](assets-postman/9.%20public%20verification%20API%20endpoint.png)

---

### Token usage count increments after verification of a document

![Token usage count increases](assets-postman/9a.%20usage%20count%20updation%20in%20database%20after%20token%20use.png)

---

### GET /api/audit/:documentId [View Audit Logs of Document By ID]

![View Audit Log](assets-postman/10.%20audit%20log%20API%20endpoint.png)

---

## API Endpoints

### Authentication

* `POST /api/auth/register` – Register a new user
* `POST /api/auth/login` – Login and receive JWT

### Document Management

* `POST /api/documents` – Upload a new document
* `GET /api/documents` – List all user's documents
* `GET /api/documents/:id` – Get details for a document
* `PUT /api/documents/:id` – Update document metadata
* `DELETE /api/documents/:id` – Delete a document

### Document Verification

* `POST /api/zk/verify` – Owner-only zero-knowledge verification
* `POST /api/public/verify` – Public verification using a verification token

### Verification Token Management

* `POST /api/tokens` – Generate/share a verification token
* `GET /api/tokens` – List all issued tokens
* `GET /api/tokens/:documentId` – List tokens for a document
* `DELETE /api/tokens/:id` – Delete a verification token

### Audit Logging

* `GET /api/audit/documents/:id` – Get audit logs for a document
* `GET /api/audit/me` – Get user activity logs

## Verification Token System

The verification token system is **usage-based**:

* **Usage Limit**: Each token is valid for a configurable number of uses (default: 5)
* **Usage Count**: Every verification attempt increments the counter
* **Automatic Expiry**: Token becomes invalid when usage limit is reached
* **Flexible Sharing**: Allows sharing verification rights without time pressure

### Benefits

* **Predictable Access**: Control exactly how many verifications are allowed
* **No Time Expiry**: Tokens expire by use, not by date
* **Customizable**: Set usage limits per token
* **Resource Efficient**: Avoids unused token expirations

## Getting Started

### Prerequisites

* Node.js 14.x or later
* MongoDB instance

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/shashankkrish/ZeroKnowledge-Attest.git
   cd ZeroKnowledge-Attest
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Add environment variables  
   Create a `.env` file:

   ```
   MONGO_URI=mongodb://localhost:27017/zk-notary
   JWT_SECRET=your_secret_key_here
   PORT=5132
   ZK_SECRET=your_zk_secret_key_here
   ```

4. Start the server

   ```bash
   npm start
   ```

## Security Features

* **Zero-Knowledge Proofs**: Ensures privacy during verification
* **JWT Authentication**: Secure, stateless session handling
* **Usage-Limited Tokens**: Fine-grained, shareable verification access
* **Audit Logging**: Tracks all sensitive and critical actions

## Project Structure

```
├─ src/                      # Backend source code
│  ├─ middleware/            # JWT authentication middleware
│  │  └─ auth.js
│  ├─ models/                # MongoDB schemas and models
│  │  ├─ AuditLog.js
│  │  ├─ Document.js
│  │  ├─ User.js
│  │  └─ VerificationToken.js
│  ├─ routes/                # Express route definitions
│  │  ├─ audit.js
│  │  ├─ auth.js
│  │  ├─ documents.js
│  │  ├─ public.js
│  │  ├─ tokens.js
│  │  └─ zk.js
│  ├─ utils/                 # Utility functions
│  │  ├─ auditUtils.js
│  │  ├─ errorUtils.js
│  │  ├─ upload.js
│  │  └─ zkUtils.js
│  └─ server.js              # Main application entry point
├─ assets-postman/           
│  ├─ 1.user-register.png
│  ├─ 2.user-login.png
│  ├─ 3.post-document.png
│  └─ ...                    # Screenshots of all API responses in assets-postman/
├─ .env                      # Environment variable definitions
├─ package.json              # Project dependencies and scripts
└─ README.md                 # Project documentation (this file)
```

## Author

Shashank Krishnaprasad

## License

This project is licensed under the ISC License - see the LICENSE file for details.
