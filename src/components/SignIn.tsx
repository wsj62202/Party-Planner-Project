// src/components/SignIn.tsx

import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      // Configure provider
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("Sign in successful:", result.user.email);
        navigate("/profile");
      } catch (popupError) {
        console.log("Popup failed, trying redirect...", popupError);
        // If popup fails, fall back to redirect
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="sign-in p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Sign In</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleSignIn}
        disabled={isSigningIn}
        className="bg-white text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow hover:shadow-md transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSigningIn ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        ) : (
          <>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-6 h-6 mr-2"
            />
            Sign in with Google
          </>
        )}
      </button>
    </div>
  );
};

export default SignIn;