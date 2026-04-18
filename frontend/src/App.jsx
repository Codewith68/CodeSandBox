import './App.css'
import { Router } from './Router'
import { useAuthInit } from './hooks/useAuthInit'


function App() {
    // Initialize auth state on app mount (try refresh token)
    useAuthInit();

    return (
        <Router />
    )
}

export default App
