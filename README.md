# Kristina Nails - Price List

A beautiful, responsive price list for Kristina Nails salon with admin functionality for price management.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free tier works fine)

### Installation

1. Clone this repository or download the files
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
   ```
4. Initialize the database with your data:
   ```
   node scripts/initDb.js
   ```
5. Start the development server:
   ```
   npm start
   ```
6. Open your browser:
   - Main price list: `http://localhost:8888/`
   - Admin panel: `http://localhost:8888/admin.html`

### Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Add the environment variable `MONGODB_URI` in Netlify's dashboard
4. Deploy your site

### Admin Access

Default credentials:
- Username: admin
- Password: admin

## File Structure

- `index.html` - Main price list
- `admin.html` - Admin panel
- `styles.css` - Main styles
- `admin-styles.css` - Admin panel styles
- `script.js` - Client-side JavaScript for the main page
- `admin.js` - Client-side JavaScript for the admin panel
- `functions/` - Netlify serverless functions
- `data.json` - Initial data file (used only for local development)

## Customization

You can customize the color scheme by modifying the CSS variables in `styles.css` and `admin-styles.css`.

## Features

- Modern, responsive design
- Light/Dark mode toggle
- Service categorization
- Admin panel for easy content management
- WhatsApp integration

## Security Considerations

For production deployment:
1. Implement proper authentication with a backend server
2. Use HTTPS
3. Hash passwords
4. Implement secure session management
5. Change default admin credentials

## Support

For any issues or questions, please contact the developer. 