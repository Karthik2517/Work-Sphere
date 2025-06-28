# Supabase Setup for Work Sphere

This guide will help you set up Supabase as your database for the Work Sphere application.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `work-sphere`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
6. Click "Create new project"

### 2. Get Your Credentials

1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy the following:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

### 3. Set Environment Variables

Create a `.env` file in your project root and add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Click "Run" to create the tables

### 5. Migrate Your Data

1. In the SQL Editor, copy and paste the contents of `migrate-data.sql`
2. Click "Run" to insert your existing data

### 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Your app should now be connected to Supabase!

## 📊 Database Schema

### Tables Created:

1. **employees** - Store employee information
2. **events** - Store event types
3. **work_entries** - Store work time entries

### Features:

- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Triggers for automatic updates

## 🔐 Security

The database includes Row Level Security policies that allow:
- Everyone to view data (for now)
- Admins to perform all operations
- Future: Employee-specific access control

## 🛠️ API Usage

The application now uses Supabase client instead of REST API calls:

```javascript
import { workEntriesApi, employeesApi, eventsApi } from '../services/supabaseApi'

// Get all work entries
const entries = await workEntriesApi.getAll()

// Create new employee
const newEmployee = await employeesApi.create({
  name: 'John Doe',
  password: 'password123',
  role: 'employee'
})
```

## 🔄 Migration from JSON Server

The old JSON server setup is still available as a fallback. To switch back:

1. Comment out Supabase imports
2. Uncomment the old API calls
3. Start your local server: `cd server && node server.js`

## 📝 Next Steps

1. **Authentication**: Implement proper JWT authentication
2. **Password Hashing**: Hash passwords before storing
3. **Real-time Features**: Enable real-time subscriptions
4. **File Storage**: Use Supabase Storage for file uploads
5. **Edge Functions**: Create serverless functions for complex operations

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables
2. **"Table doesn't exist"**: Run the schema.sql first
3. **"Permission denied"**: Check RLS policies
4. **"Connection failed"**: Verify your Supabase URL

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the browser console for detailed error messages 