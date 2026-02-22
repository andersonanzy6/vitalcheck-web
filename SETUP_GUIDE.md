# VitalCheck Web App - Setup & Migration Guide

## 📋 What Was Created

A **Vite React Web App** has been created in the `web/` folder at the root of your VitalCheck project. This is a complete conversion of the React Native mobile app to a web-based application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will automatically open at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
web/
├── public/                  # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DoctorProfile.jsx
│   │   ├── PatientProfile.jsx
│   │   ├── BookingPage.jsx
│   │   └── AppointmentsPage.jsx
│   ├── context/            # React Context for state
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── services/           # API client
│   │   └── apiClient.js
│   ├── hooks/              # Custom hooks
│   │   └── useAuthCheck.js
│   ├── constants/          # App constants
│   │   └── index.js
│   ├── styles/             # CSS files
│   │   ├── index.css
│   │   ├── auth.css
│   │   ├── header.css
│   │   ├── sidebar.css
│   │   ├── dashboard.css
│   │   ├── profile.css
│   │   ├── booking.css
│   │   └── appointments.css
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
├── .eslintrc.json          # Linting rules
├── tsconfig.json           # TypeScript config
└── README.md               # Documentation
```

## ✨ Key Features Implemented

### Authentication
- ✅ Login page
- ✅ Registration page (Patient & Doctor)
- ✅ JWT token management via localStorage
- ✅ Automatic token attachment to API requests
- ✅ Protected routes based on user roles

### Patient Features
- ✅ Dashboard with upcoming appointments
- ✅ Book new appointments
- ✅ View appointment details
- ✅ Cancel appointments
- ✅ Browse available doctors
- ✅ Patient profile management

### Doctor Features
- ✅ Dashboard with appointment statistics
- ✅ View all appointments
- ✅ Appointment management
- ✅ Doctor profile management

### Backend Connection
- ✅ Connected to `https://vitalcheck-56uj.onrender.com/api`
- ✅ All API endpoints integrated
- ✅ Error handling with 401 auto-logout
- ✅ API interceptors for token management

## 🔄 Migration Changes from Mobile

### Storage
- **Mobile**: `AsyncStorage` → **Web**: `localStorage`
- No behavior change, just adapted to web standards

### Navigation
- **Mobile**: `expo-router` → **Web**: `react-router-dom`
- Routes updated but navigation flow remains the same

### UI Components
- **Mobile**: React Native components → **Web**: HTML elements
- `View` → `div`
- `Text` → `span/p`
- `TouchableOpacity` → `button/clickable div`
- `SafeAreaView` → standard layouts

### Styling
- **Mobile**: StyleSheet → **CSS files**
- Responsive design implemented
- Dark mode support ready (ThemeContext)

### Platform-Specific Code
- Removed expo dependencies
- Removed react-native imports
- Removed mobile-specific features (permissions, camera, etc.)

## 🔗 Backend API Connection

The app is configured to connect to your backend API:

```
API Base URL: https://vitalcheck-56uj.onrender.com/api
```

### Supported Endpoints

All endpoints from the mobile app are available:
- Authentication: `/auth/login`, `/auth/register`, `/auth/logout`
- Doctor: `/doctors/profile`, `/doctors/appointments`, `/doctors/dashboard`
- Patient: `/patients/profile`, `/patients/appointments`, `/patients/doctors`
- Medical Records: `/medical-records`
- Chat: `/chat/conversations`, `/chat/conversations/:id/messages`

## 🎨 Styling

The app uses custom CSS with:
- Modern color scheme (purple gradient: #667eea → #764ba2)
- Responsive design (mobile-first)
- Consistent component styling
- Hover and active states

All styles are organized in `src/styles/` folder:
- `index.css` - Global styles
- `auth.css` - Login/Register pages
- `header.css` - Header component
- `sidebar.css` - Sidebar navigation
- `dashboard.css` - Dashboard pages
- `profile.css` - Profile pages
- `booking.css` - Booking page
- `appointments.css` - Appointments page

## 🔐 Authentication Flow

1. User visits `/login` or `/register`
2. Submits credentials to backend
3. Returns `token` and `user` object
4. Token saved to `localStorage`
5. User redirected to dashboard based on role
6. Token automatically attached to all API requests
7. 401 errors trigger logout and redirect to login

## 📱 Responsive Design

The app is fully responsive:
- Desktop: 1200px+ (full layout)
- Tablet: 768px-1199px (adjusted layout)
- Mobile: <768px (stacked layout)

## 🚦 Development Tips

### Add a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Wrap with `PrivateRoute` if protected
4. Create corresponding CSS if needed

### Add API Endpoint
1. Add function to `src/services/apiClient.js`
2. Export and use in components

### Use Authentication
```jsx
import { useAuth } from './context/AuthContext'

function MyComponent() {
  const { user, isLoggedIn, logout } = useAuth()
  // Use auth data
}
```

### Use Theme
```jsx
import { useTheme } from './context/ThemeContext'

function MyComponent() {
  const { isDarkMode, toggleTheme, colors } = useTheme()
  // Use theme
}
```

## 🛠 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📦 Dependencies

- `react` - UI framework
- `react-dom` - React DOM library
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `socket.io-client` - WebSocket communication (ready for chat)

## ⚠️ Important Notes

1. **localStorage vs AsyncStorage**: Both have similar APIs. Data persists across sessions.

2. **Token Management**: Make sure your backend sends JWT token with login response in `token` field.

3. **CORS**: If you get CORS errors, ensure your backend allows the web app origin.

4. **Environment**: Copy `.env.example` to `.env` if you need environment variables.

5. **Mobile App**: The existing mobile app in `mobile/` folder remains untouched and continues to work independently.

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- --port 3001
```

### API connection errors
- Check if `https://vitalcheck-56uj.onrender.com/api` is accessible
- Verify CORS headers on backend
- Check browser console for detailed errors

### Authentication not working
- Confirm backend returns `token` in response
- Check localStorage in DevTools
- Verify JWT format (should start with 'eyJ')

### Styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check browser DevTools for CSS conflicts

## 📖 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Test login/register functionality
4. ✅ Test patient and doctor flows
5. 🔄 Deploy to hosting (Vercel, Netlify, etc.)

## 📞 Support

For issues or questions:
- Check the README.md in `web/` folder
- Review component prop types in code
- Check browser console for error messages
- Verify backend API is running

---

**Ready to use!** The web app is fully functional and connected to your backend API.
