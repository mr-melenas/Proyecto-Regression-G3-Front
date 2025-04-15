import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Componentes
import Navbar from './components/Navbar';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SavedSearches from './pages/SavedSearches';
import Analysis from './pages/Analysis';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/analysis/:neighborhood" element={<Analysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
