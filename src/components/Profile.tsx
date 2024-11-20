// src/components/Profile.tsx

import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  DocumentData
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { Event } from "../types/event";
import { Calendar, MapPin, Globe, Lock, Loader } from 'lucide-react';

const Profile: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeEvents = () => {};

    const setupEventListener = async (currentUser: User) => {
      console.log("Setting up event listener for user:", currentUser.uid); // Debug log

      try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("createdBy", "==", currentUser.uid));

        // First get initial data
        const querySnapshot = await getDocs(q);
        console.log("Initial query returned:", querySnapshot.size, "documents"); // Debug log

        const initialEvents = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Document data:", data); // Debug log
          return {
            id: doc.id,
            ...data
          };
        }) as Event[];

        console.log("Processed events:", initialEvents); // Debug log
        setEvents(initialEvents);
        setLoading(false);

        // Set up real-time listener
        unsubscribeEvents = onSnapshot(q, (snapshot) => {
          console.log("Snapshot update received, docs:", snapshot.size); // Debug log
          const newEvents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Event[];
          setEvents(newEvents);
        }, (error) => {
          console.error("Snapshot error:", error);
          setError("Unable to get real-time updates.");
        });

      } catch (error) {
        console.error("Query setup error:", error);
        setError("Failed to load your events.");
        setLoading(false);
      }
    };

    const authListener = async (currentUser: User | null) => {
      console.log("Auth state changed:", currentUser?.uid); // Debug log
      setUser(currentUser);

      if (currentUser) {
        await setupEventListener(currentUser);
      } else {
        setEvents([]);
        setLoading(false);
      }
    };

    unsubscribeAuth = auth.onAuthStateChanged(authListener);

    return () => {
      unsubscribeAuth();
      unsubscribeEvents();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-900">Profile</h2>
          <p className="text-blue-800 mb-6">Please sign in to view your profile.</p>
          <Link
            to="/signin"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="p-4 max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-4 underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Your Profile</h2>
              <p className="text-blue-700">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-blue-900">Your Events</h3>
            <Link
              to="/create-event"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              Create New Event
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin text-blue-500 mr-2" />
              <span className="text-blue-700">Loading your events...</span>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800 mb-2">
                        {event.title}
                      </h4>
                      <p className="text-blue-700 text-sm mb-2">
                        {event.description}
                      </p>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-blue-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-blue-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    {event.isPublic ? (
                      <Globe className="text-orange-500 w-5 h-5" />
                    ) : (
                      <Lock className="text-blue-500 w-5 h-5" />
                    )}
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <Link
                      to={`/event/${event.id}`}
                      className="bg-blue-900 text-orange-50 px-4 py-2 rounded hover:bg-blue-800 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/edit-event/${event.id}`}
                      className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors duration-200"
                    >
                      Edit Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-blue-800 mb-4">You haven't created any events yet.</p>
              <Link
                to="/create-event"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
              >
                Create Your First Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;