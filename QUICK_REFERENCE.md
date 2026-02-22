# VitalCheck Web App - Developer Quick Reference

## 🚀 Quick Start (Copy & Paste)

```bash
# Navigate to web folder
cd web

# Install dependencies
npm install

# Start dev server (opens browser automatically)
npm run dev

# Build for production
npm run build
```

## 📂 Important Paths

```
web/
├── src/App.jsx              ← Routes & main structure
├── src/pages/               ← Page components
├── src/components/          ← Reusable components
├── src/services/apiClient.js ← API endpoints
├── src/context/AuthContext.js ← Auth state
├── src/styles/              ← CSS files
└── vite.config.js           ← Vite config & API proxy
```

## 🔗 Key APIs

### Authentication
```javascript
import { authAPI } from '@/services/apiClient'

// Login
const { token, user } = await authAPI.login(email, password)

// Register  
const { token, user } = await authAPI.register(userData)

// Logout
await authAPI.logout()
```

### Doctors
```javascript
import { doctorAPI } from '@/services/apiClient'

doctorAPI.getProfile()              // Get doctor profile
doctorAPI.updateProfile(data)       // Update profile
doctorAPI.getAppointments()         // Get all appointments
doctorAPI.getDashboard()            // Dashboard stats
```

### Patients
```javascript
import { patientAPI } from '@/services/apiClient'

patientAPI.getProfile()             // Get patient profile
patientAPI.updateProfile(data)      // Update profile
patientAPI.getDoctors()             // List doctors
patientAPI.bookAppointment(data)    // Book appointment
patientAPI.getAppointments()        // Get appointments
patientAPI.cancelAppointment(id)    // Cancel appointment
```

## 🎣 Custom Hooks

```javascript
import { useAuth } from '@/context/AuthContext'

const { user, token, loading, isLoggedIn, login, logout } = useAuth()
```

```javascript
import { useTheme } from '@/context/ThemeContext'

const { isDarkMode, toggleTheme, colors } = useTheme()
```

## 🧩 Common Components

### PrivateRoute (Route Protection)
```jsx
<Route 
  path="/protected" 
  element={<PrivateRoute requiredRole="doctor"><Page /></PrivateRoute>}
/>
```

### Header
```jsx
<Header title="Page Title" user={user} />
```

### Sidebar
```jsx
<Sidebar userRole="doctor" onLogout={handleLogout} />
```

## 📝 Create New Page

### 1. Create Component
```jsx
// src/pages/MyPage.jsx
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import '../styles/my-page.css'

const MyPage = () => {
  const { user, logout } = useAuth()
  
  return (
    <div className="dashboard-container">
      <Sidebar userRole={user?.role} onLogout={logout} />
      <div className="dashboard-content">
        <Header title="My Page" user={user} />
        <div className="dashboard-main">
          {/* Content */}
        </div>
      </div>
    </div>
  )
}

export default MyPage
```

### 2. Add Route
```jsx
// App.jsx
<Route 
  path="/my-page" 
  element={<PrivateRoute><MyPage /></PrivateRoute>}
/>
```

### 3. Create Styles
```css
/* src/styles/my-page.css */
.my-page-container {
  /* Your styles */
}
```

## 🔧 API Calls Pattern

```jsx
import { useState, useEffect } from 'react'
import { patientAPI } from '../services/apiClient'

function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await patientAPI.getDoctors()
        setData(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && <p>Data loaded</p>}
    </div>
  )
}

export default MyComponent
```

## ✏️ Form Pattern

```jsx
import { useState } from 'react'
import { patientAPI } from '../services/apiClient'

function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await patientAPI.updateProfile(formData)
      alert('Saved!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}

export default MyForm
```

## 🎨 Styling Pattern

```jsx
// Component
import '../styles/my-component.css'

function MyComponent() {
  return (
    <div className="my-component">
      <h1 className="my-title">Title</h1>
      <p className="my-text">Text</p>
    </div>
  )
}
```

```css
/* Styles */
.my-component {
  padding: 20px;
  background: white;
}

.my-title {
  font-size: 24px;
  color: #333;
}

.my-text {
  color: #666;
}
```

## 🚦 Navigation

```jsx
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate('/dashboard')}>
      Go to Dashboard
    </button>
  )
}
```

## 🔐 Check Authentication

```jsx
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { isLoggedIn, user, loading } = useAuth()

  if (loading) return <p>Loading...</p>
  if (!isLoggedIn) return <p>Not logged in</p>

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Role: {user.role}</p>
    </div>
  )
}
```

## 📱 Responsive CSS Pattern

```css
/* Desktop (default) */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Tablet */
@media (max-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

## 🎯 Common Issues & Fixes

### Issue: Import not found
```javascript
// ❌ Wrong
import Header from './Header'

// ✅ Correct
import Header from '../components/Header'
```

### Issue: Async/await not working
```javascript
// ❌ Forgot to make function async
function loadData() {
  const response = await api.get() // Error!
}

// ✅ Correct
async function loadData() {
  const response = await api.get() // Works!
}
```

### Issue: State not updating
```javascript
// ❌ Don't mutate state directly
state.name = 'John'

// ✅ Create new object
setState({ ...state, name: 'John' })
```

### Issue: Component not rendering
```javascript
// ❌ Missing return
function Component() {
  <div>Content</div>
}

// ✅ Return the JSX
function Component() {
  return <div>Content</div>
}
```

## 📦 Scripts Reference

```bash
npm run dev       # Development server (Port 3000)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint checks
```

## 🔑 Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=https://vitalcheck-56uj.onrender.com/api
```

Use in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## 📚 Color Constants

```javascript
// src/constants/index.js
const COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#27ae60',
  WARNING: '#f39c12',
  DANGER: '#e74c3c',
}
```

Use in CSS:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}

.button {
  background: var(--primary-color);
}
```

## 🔍 Debug Tips

### Check Auth State
```javascript
// In browser console
const token = localStorage.getItem('authToken')
const user = JSON.parse(localStorage.getItem('user'))
console.log({ token, user })
```

### Check API Response
```javascript
// In browser DevTools → Network tab
// Click API request to see response
```

### Check Component State
```javascript
// Use React DevTools browser extension
// Inspect component in Elements tab
```

## 📖 Key Files to Know

| File | Purpose |
|------|---------|
| `App.jsx` | Routes and main setup |
| `apiClient.js` | API configuration |
| `AuthContext.js` | Auth logic |
| `PrivateRoute.jsx` | Route protection |
| `main.jsx` | Entry point |
| `vite.config.js` | Build config |

---

**Keep this handy while developing!**
