# VitalCheck Web App

A modern React web application for health consultation, built with Vite.

## Features

### For Patients
- 📅 Book appointments with doctors
- 👨‍⚕️ Browse available doctors by specialization
- 📋 View appointment history
- 👤 Manage personal health profile
- 🏥 Track medical records
- 💬 Chat with doctors

### For Doctors
- 📊 View dashboard with appointment statistics
- 📋 Manage patient appointments
- 👥 View patient profiles
- 💬 Chat with patients
- 👤 Manage professional profile

## Tech Stack

- **React 19.1** - UI framework
- **Vite 5** - Build tool
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Socket.io** - Real-time communication

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── PrivateRoute.jsx
├── pages/           # Page components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DoctorDashboard.jsx
│   ├── PatientDashboard.jsx
│   ├── DoctorProfile.jsx
│   ├── PatientProfile.jsx
│   ├── BookingPage.jsx
│   └── AppointmentsPage.jsx
├── context/         # React Context providers
│   ├── AuthContext.js
│   └── ThemeContext.js
├── services/        # API services
│   └── apiClient.js
├── hooks/           # Custom React hooks
│   └── useAuthCheck.js
├── styles/          # CSS stylesheets
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Installation

1. **Clone the repository**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## API Connection

The web app connects to the VitalCheck backend API at:
```
https://vitalcheck-56uj.onrender.com/api
```

### Key API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Doctor Endpoints
- `GET /doctors/profile` - Get doctor profile
- `PUT /doctors/profile` - Update doctor profile
- `GET /doctors/appointments` - List doctor appointments
- `GET /doctors/dashboard` - Get dashboard statistics

#### Patient Endpoints
- `GET /patients/profile` - Get patient profile
- `PUT /patients/profile` - Update patient profile
- `GET /patients/appointments` - List patient appointments
- `POST /patients/appointments` - Book new appointment
- `GET /patients/doctors` - Get available doctors
- `GET /patients/dashboard` - Get dashboard statistics

#### Medical Records
- `GET /medical-records` - List medical records
- `POST /medical-records` - Create medical record
- `PUT /medical-records/:id` - Update medical record
- `DELETE /medical-records/:id` - Delete medical record

#### Chat
- `GET /chat/conversations` - Get conversations
- `GET /chat/conversations/:id/messages` - Get messages
- `POST /chat/conversations/:id/messages` - Send message
- `POST /chat/conversations` - Start new conversation

## State Management

The app uses React Context for state management:

### AuthContext
Manages authentication state including:
- User data
- Authentication token
- Login/logout functions
- Loading state

### ThemeContext
Manages theme preferences:
- Dark/light mode toggle
- Theme colors and styling

## Authentication Flow

1. User logs in with email and password
2. Backend returns user data and JWT token
3. Token is stored in localStorage
4. Token is automatically attached to API requests
5. Users are redirected based on their role (doctor/patient)

## Error Handling

- API errors are caught and displayed to users
- 401 errors trigger automatic logout and redirect to login
- Network errors show user-friendly messages

## Responsive Design

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Add New Pages**
   - Create component in `src/pages/`
   - Export it from the page component
   - Add route in `App.jsx`

2. **Create API Services**
   - Add endpoint functions in `src/services/apiClient.js`
   - Use axios client for requests

3. **Add Styles**
   - Create CSS file in `src/styles/`
   - Import in component

4. **Use Contexts**
   - Use `useAuth()` for auth state
   - Use `useTheme()` for theme state

## License

This project is part of the VitalCheck health consultation platform.
