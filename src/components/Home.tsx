// src/components/Home.tsx

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Event } from "../types/event";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Globe, Loader } from 'lucide-react';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const user = auth.currentUser;
        console.log("Current user:", user?.uid); // Debug log

        // Get all events first
        const eventsRef = collection(db, "events");
        const querySnapshot = await getDocs(eventsRef);
        console.log("Total events found:", querySnapshot.size); // Debug log

        // Filter public events client-side
        const publicEvents = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Event))
          .filter(event => event.isPublic === true);

        console.log("Public events:", publicEvents.length); // Debug log

        // Sort by date
        const sortedEvents = publicEvents.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-blue-500" size={24} />
          <span className="text-blue-700">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Public Events</h1>
          <Link
            to="/create-event"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            Create Event
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-blue-800 mb-4">No public events available yet.</p>
            <Link
              to="/create-event"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              Create the First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-blue-900">{event.title}</h2>
                    {event.isPublic && (
                      <Globe className="text-orange-500 w-5 h-5" />
                    )}
                  </div>

                  <p className="text-blue-700 mb-4">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-blue-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <Link
                    to={`/event/${event.id}`}
                    className="inline-block bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;