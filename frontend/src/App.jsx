import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e2a4a',
            color: '#e2e8f0',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0a0e1a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0e1a' },
            duration: 5000,
          },
          loading: {
            iconTheme: { primary: '#3b82f6', secondary: '#0a0e1a' },
          },
        }}
      />
    </AuthProvider>
  )
}

export default App
