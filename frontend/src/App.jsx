import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import {Login} from './pages/Login.jsx'
import {Register} from './pages/Register.jsx';

import './App.css'
import {Dashboard} from "./pages/Dashboard.jsx";

function App() {
  return (
    <BrowserRouter>
        <Routes>
            {/*<Route path="/" element={<Navigate to="/auth/login" replace  />}/>*/}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/*<Route path="*" element={<div>Page Not made</div>} />*/}
        </Routes>
    </BrowserRouter>
  )
}

export default App
