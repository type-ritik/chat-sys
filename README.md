# ViteMessage

## Project Explanation

ViteMessage project is inspired by some Facebook feature like:

- Friend Request
- Friend Explore
- Chat Cell
- Text Message
- Private Chat
- Notification
- Login / Signup

like some very useful features which make facebook best.

## Purpose

ViteMessage is developed by `Ritik Sharma`. His sole purpose was to learn how exaclty our facebook or anyother application like WhatsApp exaclty work under the hood? How they send message from one close environment to whole world? How I make one? Those were his question to start developing this application.

## What it does

ViteMessage login/Signup user, from that point user choose:

1. If he doesn't have any friend find by username and send request
2. Else from chatroom start chatting with any of his friend
3. UserA can send message by Texting on our Custom made Editor and Send
4. If UserB is online:

- He will receive message in between the time interval of 1s

5. Else UserB is offline:

- Message will stored in Database and When user is online He'll notified

6. User can change his profile data and Read other's people profile
7. User notified about friend request or reject and Chat Notification

## Installation

ViteMessage is easy to install:

### Server Stack: [PostgreSQL] [Prisma] [Express] [Redis] [GraphQL] [ApolloServer] [JavaScript]

1. Clone the repositories
2. Move to \Server env and use `npm install -y` on terminal or simply `npm install`
3. Set your database URL on `.env` and `Token`
4. Then run the command on Terminal `npm run dev`

### Client Stack: [React] [Vite] [ApolloClient] [GraphQL] [TailwindCSS] [TypeScript]

1. Hopefully perform Server installation
2. Move to \Client env and user `npm install`
3. Then run the command on Terminal `npm run dev`

# Usage

You will encounter the the first page for `\login` or `\signup` in `http://localhost:5173/signup` after login your username will set based on your unique email address and then you are welcome to ViteMessage
