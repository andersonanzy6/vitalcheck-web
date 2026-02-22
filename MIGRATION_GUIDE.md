# VitalCheck Web App - Migration & Extension Guide

## Technology Stack Comparison

### React Native Mobile App → Vite React Web App

| Feature | Mobile (React Native) | Web (Vite React) |
|---------|---------------------|------------------|
| **Framework** | React 19 + Expo | React 19 + Vite |
| **Navigation** | Expo Router | React Router DOM |
| **Storage** | AsyncStorage | localStorage |
| **HTTP Client** | Axios | Axios |
| **Real-time** | Socket.io | Socket.io |
| **Build Speed** | Slow | ⚡ Very Fast |
| **Dev Server** | Expo CLI | Vite Dev Server |
| **Bundle Size** | Large | Smaller |
| **Hot Reload** | Yes | Yes (Faster) |

## Migration Details

### 1. Storage API

#### Mobile (AsyncStorage)
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('authToken');
await AsyncStorage.setItem('authToken', token);
await AsyncStorage.removeItem('authToken');
```

#### Web (localStorage)
```javascript
// No imports needed - browser API
const token = localStorage.getItem('authToken');
localStorage.setItem('authToken', token);
localStorage.removeItem('authToken');
```

**No behavior change** - Just adapted to web standards.

### 2. Navigation

#### Mobile (Expo Router)
```javascript
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/dashboard');
router.replace('/login');
```

#### Web (React Router)
```javascript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
navigate('/login', { replace: true });
```

**Similar API** - Just different package.

### 3. UI Components

#### Mobile (React Native)
```jsx
import { View, Text, ScrollView } from 'react-native';

<View style={styles.container}>
  <Text>Hello World</Text>
  <ScrollView>...</ScrollView>
</View>
```

#### Web (HTML)
```jsx
<div className="container">
  <p>Hello World</p>
  <div style={{ overflowY: 'auto' }}>...</div>
</div>
```

**Direct mapping** - No functional changes.

### 4. Styling

#### Mobile (StyleSheet)
```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  }
});
```

#### Web (CSS)
```css
.container {
  display: flex;
  flex: 1;
  padding: 20px;
  background-color: #fff;
}

/* Or inline */
style={{ flex: 1, padding: 20 }}
```

**More flexible** - All CSS features available.

## Architecture Parallels

### Context API (Same in Both)
```javascript
// Both use React Context the same way
const { user, login, logout } = useAuth();
```

**No changes needed** - Context works identically.

### API Client (Same in Both)
```javascript
// Both use Axios identically
const response = await patientAPI.getAppointments();
```

**No changes needed** - API layer is platform-agnostic.

## File Structure

### Mobile
```
mobile/
├── app/              (Expo Router groups)
├── components/       (React Native components)
├── context/          (Auth, Theme)
├── services/         (API client)
├── hooks/            (Custom hooks)
└── assets/
```

### Web
```
web/
├── src/
│   ├── components/   (React components)
│   ├── pages/        (Page components)
│   ├── context/      (Auth, Theme)
│   ├── services/     (API client)
│   ├── hooks/        (Custom hooks)
│   ├── styles/       (CSS files)
│   └── constants/    (App constants)
├── public/           (Static assets)
└── src/main.jsx      (Entry point)
```

## Feature Status

### Fully Implemented ✅
- Authentication (Login/Register)
- Doctor Dashboard
- Patient Dashboard
- Profile Management
- Appointment Booking
- Appointment Management
- Role-based Routing
- API Integration
- Error Handling
- Loading States

### Ready for Implementation 🔄
- Medical Records Page
- Chat Interface
- Video Consultation
- Notifications
- Search/Filters
- Pagination

### Mobile-Specific (Not Migrated) ❌
- Camera integration
- Gallery/Photo picker
- Push notifications
- Native haptics
- App permissions
- Deep linking to mobile apps

## Extending the Web App

### Add a New Page

1. **Create page component** in `src/pages/NewPage.jsx`
```jsx
import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const NewPage = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Header title="New Page" />
        <div className="dashboard-main">
          {/* Content here */}
        </div>
      </div>
    </div>
  )
}

export default NewPage
```

2. **Add route** in `src/App.jsx`
```jsx
<Route path="/new-page" element={<PrivateRoute><NewPage /></PrivateRoute>} />
```

3. **Create styles** in `src/styles/new-page.css`
```css
.new-page-container {
  /* Your styles */
}
```

4. **Import styles** in your component
```jsx
import '../styles/new-page.css'
```

### Add API Endpoint

Edit `src/services/apiClient.js`:
```javascript
export const newAPI = {
  getItems: () =>
    apiClient.get('/items'),
  createItem: (data) =>
    apiClient.post('/items', data),
  updateItem: (id, data) =>
    apiClient.put(`/items/${id}`, data),
  deleteItem: (id) =>
    apiClient.delete(`/items/${id}`),
}
```

### Add Custom Hook

Create `src/hooks/useNewFeature.js`:
```javascript
import { useState, useEffect } from 'react'

export const useNewFeature = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize
  }, [])

  return { data, loading }
}
```

### Implement Chat (Socket.io)

Socket.io client is already installed. Use it for real-time features:

```javascript
import { io } from 'socket.io-client'

const socket = io('https://vitalcheck-56uj.onrender.com')

// Listen for events
socket.on('message', (data) => {
  console.log('New message:', data)
})

// Emit events
socket.emit('send_message', { text: 'Hello' })
```

## Common Patterns

### Using Auth Context
```jsx
import { useAuth } from '../context/AuthContext'

function Component() {
  const { user, isLoggedIn, logout } = useAuth()
  
  if (!isLoggedIn) {
    return <p>Not logged in</p>
  }
  
  return <p>Welcome, {user.name}</p>
}
```

### API Data Fetching
```jsx
import { useState, useEffect } from 'react'
import { patientAPI } from '../services/apiClient'

function Component() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await patientAPI.getDoctors()
        setData(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  return <div>{/* Render data */}</div>
}
```

### Conditional Rendering by Role
```jsx
function Component() {
  const { user } = useAuth()
  
  if (user?.role === 'doctor') {
    return <DoctorContent />
  }
  
  if (user?.role === 'patient') {
    return <PatientContent />
  }
}
```

## Performance Tips

1. **Code Splitting**
   - React Router supports lazy loading
   - Vite automatically optimizes

2. **Image Optimization**
   - Use responsive images
   - Compress before upload

3. **CSS Organization**
   - Keep styles modular
   - Use CSS variables for colors

4. **Bundle Analysis**
   ```bash
   npm install -D rollup-plugin-visualizer
   ```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers work great. No IE support needed ✨

## Common Issues & Solutions

### AsyncStorage → localStorage
If you forgot to convert AsyncStorage usage:
```javascript
// Wrong
const token = await localStorage.getItem('token'); // No await needed!

// Correct
const token = localStorage.getItem('token'); // Synchronous API
```

### Route Not Working
Make sure you added the route in `App.jsx` and imported the component.

### API Errors
- Check browser DevTools → Network tab
- Verify API URL in `apiClient.js`
- Check CORS headers in backend

### Component Not Showing
- Verify route is added in `App.jsx`
- Check component imports
- Clear browser cache

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Key Takeaways

1. **The Core Logic is Identical**
   - Same API endpoints
   - Same authentication flow
   - Same business logic

2. **Only the UI Layer Changed**
   - React components instead of React Native
   - HTML/CSS instead of StyleSheet
   - React Router instead of Expo Router

3. **The Web Version is Faster**
   - Vite builds in milliseconds
   - Smaller bundle size
   - Faster load times

4. **Easy to Extend**
   - Add pages easily
   - Add API endpoints easily
   - Add features easily

---

**The web app is a faithful port of the mobile app, not a complete rewrite.**
Most of your knowledge about the mobile app applies directly here!
