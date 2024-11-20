// src/components/WelcomeScreen.tsx

import React from "react";
import { Link } from "react-router-dom";
import SignIn from "./SignIn";
import { Calendar, Users, Globe, Lock } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Welcome to Party Planner
          </h1>
          <p className="text-xl text-blue-700">
            Create, manage, and share your events with ease
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Event Management</h2>
            </div>
            <p className="text-blue-700">
              Create and manage events with all the details you need
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Guest Lists</h2>
            </div>
            <p className="text-blue-700">
              Manage attendees and track RSVPs easily
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Public Events</h2>
            </div>
            <p className="text-blue-700">
              Share your events with the community
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Lock className="w-8 h-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Privacy Control</h2>
            </div>
            <p className="text-blue-700">
              Keep your events private or make them public
            </p>
          </div>
        </div>

        {/* Sign In Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
            Get Started Today
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <SignIn />
            <div className="relative w-full text-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <span className="relative px-4 bg-white text-sm text-gray-500">
                OR
              </span>
            </div>
            <Link
              to="/admin-signin"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 w-full md:w-auto"
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-600 text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;