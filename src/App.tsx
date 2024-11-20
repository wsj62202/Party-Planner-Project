// src/App.tsx

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { User } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import SignIn from "./components/SignIn";
import AdminSignIn from "./components/AdminSignIn";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateEditEvent from "./components/CreateEditEvent";
import EventDetails from "./components/EventDetails";
import AdminDashboard from "./components/AdminDashboard";
import BottomTabBar from "./components/BottomTabBar";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app flex flex-col min-h-screen bg-blue-50">
        <main className="flex-grow">
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-event" element={<CreateEditEvent />} />
                <Route path="/edit-event/:eventId" element={<CreateEditEvent />} />
                <Route path="/event/:eventId" element={<EventDetails />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/admin-signin" element={<AdminSignIn />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        {user && <BottomTabBar />}
      </div>
    </Router>
  );
};

export default App;