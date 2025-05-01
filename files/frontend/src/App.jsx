import React from "react";
import { HashRouter   as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import User from "./pages/User/User";
import Officer from "./pages/officer/Officer";
import Manager from "./pages/Manager/manager";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import History from "./pages/History/history";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}         
           <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected Routes */}
          <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={["client"]}><User /></ProtectedRoute>}/>
          <Route path="/officer-dashboard" element={<ProtectedRoute allowedRoles={["officer"]}><Officer /></ProtectedRoute>}/>
          <Route path="/manager-dashboard" element={<ProtectedRoute allowedRoles={["manager"]}><Manager /></ProtectedRoute>}/>
          <Route path="/history" element={ <ProtectedRoute allowedRoles={["client", "officer", "manager"]}><History /></ProtectedRoute>}/>
         
        </Routes>
      </Router>
    </>
  );
};
  
export default App;
