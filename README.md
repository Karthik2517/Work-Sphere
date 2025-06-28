# Work Sphere

A comprehensive work management and time tracking application built with React and Node.js. Work Sphere allows employees to log their work hours, track events, and provides administrators with powerful tools to manage employee data and generate reports.

## 🌟 Features

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

## 📦 Installation

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

## 🚀 Usage

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

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Deploy Frontend to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add environment variable: `VITE_API_URL` with your backend URL

3. **Deploy Backend to Vercel:**
   ```bash
   cd server
   vercel
   ```

### GitHub Pages
The project is configured for deployment to GitHub Pages:

```bash
npm run deploy
```

### Other Platforms
You can deploy to other platforms like:
- Netlify
- Heroku
- AWS

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
```

For production, set `VITE_API_URL` to your deployed backend URL.

### Database
The application uses a JSON file (`src/data/db.json`) as a mock database. In production, you would replace this with a real database like PostgreSQL, MongoDB, or MySQL.

## 🎨 Features in Detail

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

## 🛠️ Troubleshooting

### Blank White Screen on Vercel
If you see a blank white screen after deploying to Vercel:

1. **Check Environment Variables**: Ensure `VITE_API_URL` is set correctly
2. **Check Console Errors**: Open browser dev tools and check for errors
3. **Verify Build**: Check Vercel build logs for any build errors
4. **Check Routing**: Ensure your `vercel.json` is configured correctly

### Common Issues
- **CORS Errors**: Make sure your backend allows requests from your frontend domain
- **API Connection**: Verify your backend is deployed and accessible
- **Build Failures**: Check that all dependencies are properly installed

## 📁 Project Structure

```
Work-Sphere/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   └── LoginPage.jsx
│   ├── utils/              # Utility functions
│   │   └── api.js          # API utility functions
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
├── vite.config.js          # Vite configuration
└── vercel.json             # Vercel configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Karthik2517**
- GitHub: [@Karthik2517](https://github.com/Karthik2517)
- Email: karthikeyareddy122@gmail.com

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- Vite for the fast development experience
- Day.js for lightweight date manipulation
- Express.js for the robust backend framework

## 📞 Support

If you have any questions or need support, please:

1. Check the [Issues](https://github.com/Karthik2517/Work-Sphere/issues) page
2. Create a new issue if your problem isn't already addressed
3. Contact the author at karthikeyareddy122@gmail.com

---

⭐ **Star this repository if you find it helpful!**
