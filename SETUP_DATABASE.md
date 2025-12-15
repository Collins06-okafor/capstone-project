# Quick Database Setup Guide

## The Issue
The API is returning 500 errors because the database tables don't exist yet. The `student` user doesn't have permission to create tables.

## Quick Solution Options

### Option 1: Ask Your Instructor/Admin (Recommended)
Send them this message:

```
Hi, I need help setting up my database for a project. Can you please run these commands on the moviedb database?

Connect to moviedb first, then run:

\c moviedb

GRANT ALL ON SCHEMA public TO student;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO student;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO student;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO student;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO student;

Then I can run: node setup-db.js
```

### Option 2: If You Have Admin Credentials
If you have access to a postgres admin account:

```bash
# Using psql command line
psql -h 145.223.98.126 -U postgres -d moviedb -f schema.sql
psql -h 145.223.98.126 -U postgres -d moviedb -f seed.sql
```

### Option 3: Use pgAdmin (GUI Tool)
1. Download pgAdmin: https://www.pgadmin.org/download/
2. Connect to: 145.223.98.126, database: moviedb
3. Open Query Tool
4. Copy and paste contents of `schema.sql` → Execute
5. Copy and paste contents of `seed.sql` → Execute

### Option 4: Manual SQL (If you have any admin access)
Open any PostgreSQL client and run the SQL files in order:
1. First: `schema.sql` (creates tables)
2. Second: `seed.sql` (adds sample data)

## Verify Setup Works
After tables are created, run:
```bash
node test-db.js
```

You should see a list of tables: users, movies, theaters, showtimes, bookings

## Then Test the API
Visit: http://localhost:5000/api/movies

You should see a JSON array of movies instead of an error.

## What Happens After Setup
Once tables exist:
- ✅ Home page will show movies
- ✅ You can click on movies to see details
- ✅ Select showtimes and seats
- ✅ Create bookings
- ✅ Full application works!
