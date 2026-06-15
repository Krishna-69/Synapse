# Synapse Backend API

Synapse is a "second brain" web application designed for users to save, organize, and share digital content bookmarks (such as YouTube videos, tweets, articles, and documentation links).

This folder contains the backend REST API, built using **TypeScript**, **Node.js**, **Express**, and **MongoDB** (via **Mongoose**).

---

## Table of Contents
- [Synapse Backend API](#synapse-backend-api)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Folder Structure](#folder-structure)
  - [API Endpoints](#api-endpoints)
    - [1. Authentication](#1-authentication)
    - [2. Content Management (Authenticated)](#2-content-management-authenticated)
    - [3. Shareable Brain Links](#3-shareable-brain-links)
  - [Database Schemas](#database-schemas)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Environment Configuration](#environment-configuration)
    - [Installation](#installation)
    - [Running the Server](#running-the-server)

---

## Tech Stack
- **Runtime**: Node.js (with ES modules support)
- **Language**: TypeScript
- **Web Framework**: Express
- **Database**: MongoDB (Object Data Modeling via Mongoose)
- **Validation**: Zod (for safe request schema validation)
- **Authentication**: JWT (JSON Web Tokens)

---

## Folder Structure

```text
Synapse/
├── src/
│   ├── config.ts       # Configuration & Environment constants (JWT secrets, MongoDB URI)
│   ├── db.ts           # Mongoose schemas, models, and MongoDB connection
│   ├── index.ts        # Express application setup, routes, and controllers
│   ├── middleware.ts   # Express middlewares (JWT verification)
│   └── utils.ts        # Helper functions (e.g. random string generator for share links)
├── dist/               # Compiled JavaScript files (output of tsc)
├── package.json        # Dependencies and build scripts
└── tsconfig.json       # TypeScript compiler configurations
```

---

## API Endpoints

### 1. Authentication
* **`POST /api/v1/signup`**
  - Registers a new user.
  - Request Body: `{ "username": "...", "password": "..." }`
* **`POST /api/v1/signin`**
  - Authenticates a user and returns a JSON Web Token.
  - Request Body: `{ "username": "...", "password": "..." }`
  - Response: `{ "token": "JWT_TOKEN_HERE" }`

### 2. Content Management (Authenticated)
*Requires Bearer/JWT Token in `Authorization` request header.*

* **`POST /api/v1/content`**
  - Saves a link or bookmark.
  - Request Body: `{ "title": "...", "link": "...", "type": "..." }`
* **`GET /api/v1/content`**
  - Retrieves all content saved by the authenticated user.
* **`DELETE /api/v1/content`**
  - Deletes a specific saved bookmark.
  - Request Body: `{ "contentId": "..." }`

### 3. Shareable Brain Links
* **`POST /api/v1/brain/share`** *(Authenticated)*
  - Enables or disables sharing of the user's saved list.
  - Request Body: `{ "share": true | false }`
  - Response: Returns a random hash when `share` is enabled.
* **`GET /api/v1/brain/:shareLink`** *(Public)*
  - Publicly retrieves user's content using the unique shared link hash.

---

## Database Schemas

All schemas are declared in [db.ts]:
1. **User**: Stores username and password.
2. **Content**: Stores title, link, content type (e.g. video, tweet), and a reference to the owner (`userId`).
3. **Link**: Stores unique hashes mapping public shareable URLs to user accounts.

---

## Getting Started

### Prerequisites
- Node.js installed (v18+ recommended)
- A running MongoDB cluster (e.g., MongoDB Atlas)

### Environment Configuration
Database credentials and JWT secret are configured in [config.ts]:
* Make sure `mongoDbUrl` points to your MongoDB instance.
* Change `JWT_PASSWORD` to a secure key.

### Installation
Install the project dependencies:
```bash
npm install
```

### Running the Server
Compile and start the development server:
```bash
npm run dev
```
The server runs locally on port `3000` by default.
