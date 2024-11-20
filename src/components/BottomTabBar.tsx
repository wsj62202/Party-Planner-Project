// src/components/BottomTabBar.tsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, User, PlusSquare, Shield } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(userDoc.data()?.isAdmin || false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <nav className="bottom-nav bg-blue-900 text-orange-100 p-4 flex justify-around items-center shadow-lg fixed bottom-0 left-0 right-0">
      <Link
        to="/"
        className={`text-2xl transition-colors duration-200 ${
          location.pathname === "/" ? "text-orange-400" : "text-orange-100 hover:text-orange-300"
        }`}
        title="Home"
      >
        <HomeIcon size={24} />
      </Link>
      <Link
        to="/create-event"
        className={`text-2xl transition-colors duration-200 ${
          location.pathname === "/create-event" ? "text-orange-400" : "text-orange-100 hover:text-orange-300"
        }`}
        title="Create Event"
      >
        <PlusSquare size={24} />
      </Link>
      <Link
        to="/profile"
        className={`text-2xl transition-colors duration-200 ${
          location.pathname === "/profile" ? "text-orange-400" : "text-orange-100 hover:text-orange-300"
        }`}
        title="Profile"
      >
        <User size={24} />
      </Link>
      {isAdmin && (
        <Link
          to="/admin-dashboard"
          className={`text-2xl transition-colors duration-200 ${
            location.pathname === "/admin-dashboard" ? "text-orange-400" : "text-orange-100 hover:text-orange-300"
          }`}
          title="Admin Dashboard"
        >
          <Shield size={24} />
        </Link>
      )}
    </nav>
  );
};

export default BottomTabBar;