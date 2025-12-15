# HiMovie - Movie Tickets Selling Website

A full-stack movie ticket booking platform built with Next.js, Express.js, and PostgreSQL.

## 🏗️ Project Structure

```
himovie/
├── client/          # Next.js frontend
├── server/          # Express.js backend
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Turbopack** - Fast bundler

### Backend
- **Express.js** - Node.js web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd himovie
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

## 🗄️ Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE himovie;
```

2. Update the `DATABASE_URL` in `server/.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/himovie
```

## 🔧 Development

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm run dev
```

## 📝 Environment Variables

### Backend (`server/.env`)
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/himovie
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## 🎯 Features (To Be Implemented)

- [ ] User authentication and authorization
- [ ] Movie listings and details
- [ ] Seat selection
- [ ] Ticket booking
- [ ] Payment integration
- [ ] Admin panel
- [ ] Email notifications

## 📄 License


