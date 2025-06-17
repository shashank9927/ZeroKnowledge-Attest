# ZeroKnowledge-Attest

A secure API for notarizing documents using zero-knowledge proofs, enabling verification while preserving privacy and confidentiality.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Document Management](#document-management)
  - [Document Verification](#document-verification)
  - [Audit Logs](#audit-logs)
- [Token System](#token-system)
- [System Architecture](#system-architecture)
- [Security](#security)
- [License](#license)

## Overview

ZeroKnowledge-Attest is a document notarization system built with Node.js that allows secure verification of document authenticity without exposing the actual document contents. The system uses zero-knowledge proofs to validate document integrity while maintaining complete confidentiality.

## Features

- **Zero-Knowledge Document Verification**: Verify document authenticity without revealing content
- **Secure User Authentication**: JWT-based authentication system
- **Comprehensive Document Management**: Upload, update, retrieve, and delete documents
- **Verification Token System**: Generate limited-use tokens for sharing verification capabilities
- **Detailed Audit Logging**: Track all verification attempts and document activities
- **Public Verification API**: Allow third parties to verify documents with appropriate tokens

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Zero-Knowledge Proof cryptography

## Installation

```bash
# Clone the repository
git clone https://github.com/shashankkrish/ZeroKnowledge-Attest.git
cd ZeroKnowledge-Attest

# Install dependencies
npm install

# Start the server
npm start
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=mongodb://localhost:27017/zk-notary
JWT_SECRET=your_secret_key_here
PORT=3000
ZK_SECRET=your_zk_secret_key_here
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Document Management

#### Upload Document
```http
POST /api/documents
x-auth-token: {{auth_token}}
Content-Type: multipart/form-data

document: [file]
title: Contract Agreement
description: Legal contract between parties
```

#### Get User's Documents
```http
GET /api/documents
x-auth-token: {{auth_token}}
```

#### Get Document Details
```http
GET /api/documents/:id
x-auth-token: {{auth_token}}
```

#### Update Document Metadata
```http
PUT /api/documents/:id
x-auth-token: {{auth_token}}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Document
```http
DELETE /api/documents/:id
x-auth-token: {{auth_token}}
```

### Document Verification

#### Authenticated Verification (Owner Only)
```http
POST /api/zk/verify
x-auth-token: {{auth_token}}
Content-Type: multipart/form-data

document: [file]
documentId: 64a1b2c3d4e5f6a7b8c9d0e1
```

#### Generate Verification Token (For Sharing)
```http
POST /api/tokens
x-auth-token: {{auth_token}}
Content-Type: application/json

{
  "documentId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "usageLimit": 10
}
```

#### List Verification Tokens
```http
GET /api/tokens
x-auth-token: {{auth_token}}
```

#### Get Tokens for Specific Document
```http
GET /api/tokens/:documentId
x-auth-token: {{auth_token}}
```

#### Delete Verification Token
```http
DELETE /api/tokens/:id
x-auth-token: {{auth_token}}
```

#### Public Verification (With Token)
```http
POST /api/public/verify
Content-Type: multipart/form-data

document: [file]
verificationToken: a1b2c3d4e5f6g7h8i9j0...
```

### Audit Logs

#### Get Document Audit Logs
```http
GET /api/audit/documents/:id
x-auth-token: {{auth_token}}
```

#### Get User Activity Logs
```http
GET /api/audit/me
x-auth-token: {{auth_token}}
```

## Token System

The verification token system uses usage-based expiry instead of time-based expiry:

- **Usage Limit**: Each token has a configurable usage limit (default: 5 uses)
- **Usage Count**: Tracks how many times the token has been used for verification
- **Automatic Expiry**: Once the usage limit is reached, the token becomes invalid
- **Flexible Sharing**: Tokens can be used multiple times until the limit is exceeded

### Benefits of Usage-Based Tokens:
- **Predictable Control**: Know exactly how many verifications each token allows
- **No Time Pressure**: Tokens don't expire due to time, only usage
- **Customizable Access**: Set precise limits based on your needs
- **Resource Efficient**: No need to worry about tokens expiring before they're used

## System Architecture

- **Modular Route Structure**: Organized API endpoints for specific functionality
- **Middleware Authentication**: JWT validation for protected routes
- **MongoDB Integration**: Persistent storage for users, documents, tokens, and audit logs
- **Error Handling**: Centralized error management for consistent responses

## Security

- **Zero-Knowledge Proofs**: Document verification without content exposure
- **JWT Authentication**: Secure, token-based user authentication
- **Usage-Limited Tokens**: Controlled access to verification functionality
- **Comprehensive Logging**: Audit trail for all security-relevant actions

## License

This project is licensed under the ISC License.

---

Created by Shashank Krishnaprasad
