# Work Sphere

A comprehensive work management and time tracking application built with React and Node.js. Work Sphere allows employees to log their work hours, track events, and provides administrators with powerful tools to manage employee data and generate reports.

## Features

### For Employees
- **Time Tracking**: Log work hours with start and end times
- **Event Management**: Associate work entries with specific events/projects
- **Daily Logging**: Track work activities on a daily basis
- **User Dashboard**: View personal work history and statistics

### For Administrators
- **Employee Management**: Add and manage employee accounts
- **Work Entry Management**: Create, edit, and delete work entries for any employee
- **Advanced Filtering**: Filter work entries by employee, month, and year
- **Event Management**: Create and manage events/projects
- **Reporting Tools**: Calculate total hours and generate monthly breakdowns
- **Sorting & Organization**: Sort work entries by various criteria

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Material-UI (MUI)** - Beautiful and responsive UI components
- **React Router** - Client-side routing
- **Day.js** - Lightweight date manipulation library
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **JSON Server** - Mock REST API for development

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Karthik2517/Work-Sphere.git
   cd Work-Sphere
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   cd server
   node server.js
   ```
   The server will run on `http://localhost:3001`

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Usage

### Starting the Application

1. **Start the backend server first:**
   ```bash
   cd server
   node server.js
   ```

2. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open your browser and navigate to `http://localhost:5173`
   - Login with your credentials

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## Project Structure

```
Work-Sphere/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   └── LoginPage.jsx
│   ├── data/               # Mock data and database
│   │   └── db.json
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── server/
│   ├── server.js           # Express server
│   └── package.json        # Server dependencies
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## 🔧 Configuration

### Environment Variables
The application uses default localhost URLs. For production, you may want to configure:

- Backend API URL (currently `http://localhost:3001`)
- Frontend URL (currently `http://localhost:5173`)

### Database
The application uses a JSON file (`src/data/db.json`) as a mock database. In production, you would replace this with a real database like PostgreSQL, MongoDB, or MySQL.

## Features in Detail

### Admin Dashboard
- **Employee Management**: Add new employees with name and password
- **Event Management**: Create and manage events/projects
- **Work Entry Management**: Add, edit, and delete work entries
- **Advanced Filtering**: Filter by employee, month, and year
- **Sorting**: Sort entries by employee, date, or event
- **Reporting**: Calculate total hours and monthly breakdowns

### Employee Dashboard
- **Time Tracking**: Log work hours with automatic calculation
- **Event Association**: Link work entries to specific events
- **Personal History**: View and manage personal work entries

## 🔐 Authentication

The application includes a basic authentication system. In production, you should implement:

- JWT tokens
- Password hashing
- Session management
- Role-based access control

## Deployment

### GitHub Pages
The project is configured for deployment to GitHub Pages:

```bash
npm run deploy
```

### Other Platforms
You can deploy to other platforms like:
- Vercel
- Netlify
- Heroku
- AWS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


⭐ **Star this repository if you find it helpful!**
