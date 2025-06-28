// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:3001'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://your-backend-url.vercel.app'
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate configuration
export const API_BASE_URL = config[environment].apiUrl;

export default config[environment]; 