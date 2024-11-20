// src/components/AdminSignIn.tsx

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

const AdminSignIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData?.isAdmin) {
        // Sign out if not admin
        await auth.signOut();
        setError("Unauthorized access. Admin privileges required.");
        return;
      }

      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error signing in:", error);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-blue-900 text-center">
          Admin Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div>
            <label className="block text-blue-700 mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-blue-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:bg-orange-300"
          >
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignIn;