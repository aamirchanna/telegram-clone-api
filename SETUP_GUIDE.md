# Telegram Clone API

A real-time messaging API built with **Node.js, Express, PostgreSQL, and Socket.io**.

## Features

✓ User authentication (register/login with bcrypt)  
✓ JWT-based authorization  
✓ Chat creation & management  
✓ Real-time messaging via Socket.io  
✓ CORS enabled for cross-origin requests  
✓ Security headers with Helmet  
✓ Error handling & logging  

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Security**: Helmet, CORS

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/aamirchanna/telegram-clone-api.git
cd telegram-clone-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key
PORT=8080
NODE_ENV=development
CORS_ORIGIN=*
```

### 4. Set up database

Create the required tables in PostgreSQL:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  is_group BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat members table
CREATE TABLE chat_members (
  id SERIAL PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id),
  text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start the server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The API will run on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Chats
- `GET /chat/list` - Get all chats for logged-in user
- `POST /chat/create` - Create a new chat

### Messages
- `GET /messages/:chatId` - Get all messages in a chat
- `POST /messages/send` - Send a message (via Socket.io)

## Socket.io Events

### Client → Server
- `join_chat` - Join a chat room
- `send_message` - Send a message in real-time

### Server → Client
- `joined_chat` - Confirmation of joining a chat
- `receive_message` - New message received
- `error` - Error event

## Example Requests

### Register
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Get Chats
```bash
curl -X GET http://localhost:8080/chat/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Chat
```bash
curl -X POST http://localhost:8080/chat/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Chat","is_group":false}'
```

## Troubleshooting

### Port already in use
Change the `PORT` in `.env` or use:
```bash
PORT=3001 npm run dev
```

### Database connection error
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure tables are created

### JWT authentication fails
- Verify `JWT_SECRET` is set in `.env`
- Check `Authorization: Bearer <token>` header format
- Ensure token is not expired

### Socket.io connection issues
- Check CORS settings in `.env`
- Verify client is emitting correct event names
- Check browser console for errors

## Project Structure

```
telegram-clone-api/
├── index.js                 # Main server entry point
├── package.json
├── .env.example
├── .env                     # (Create this file)
└── src/
    ├── db.js               # Database connection
    ├── controllers/
    │   ├── auth.controllers.js
    │   ├── chat.controller.js
    │   └── message.controllers.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── chat.routes.js
    │   └── message.routes.js
    ├── middleware/
    │   └── auth.middleware.js
    └── sockets/
        └── socket.js       # Socket.io configuration
```

## Notes

- **Security**: Change `CORS_ORIGIN` in production to specific domains
- **Database**: Use Neon PostgreSQL for cloud hosting
- **JWT**: Keep `JWT_SECRET` secure and rotate periodically
- **Helmet**: Automatically sets security headers (enabled by default)

## License

ISC
