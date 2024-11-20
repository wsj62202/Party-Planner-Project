// src/components/AdminDashboard.tsx

import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import { Event, Flag } from "../types/event";
import { Loader, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [flaggedEvents, setFlaggedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedEvents();
  }, []);

  const fetchFlaggedEvents = async () => {
    try {
      const eventsRef = collection(db, "events");
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(eventsRef);

      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      const withFlags = events.filter(event => event.flags && event.flags.length > 0);
      setFlaggedEvents(withFlags);
      setError(null);
    } catch (error) {
      console.error("Error fetching flagged events:", error);
      setError("Failed to load flagged events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlagUpdate = async (eventId: string, flagIndex: number, status: Flag['status']) => {
    try {
      const event = flaggedEvents.find(e => e.id === eventId);
      if (!event) return;

      const updatedFlags = [...event.flags];
      updatedFlags[flagIndex] = {
        ...updatedFlags[flagIndex],
        status,
        timestamp: new Date()
      };

      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, { flags: updatedFlags });

      setFlaggedEvents(prev => 
        prev.map(e => 
          e.id === eventId 
            ? { ...e, flags: updatedFlags }
            : e
        )
      );

      setError("Flag status updated successfully");
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error("Error updating flag:", error);
      setError("Failed to update flag status. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setDeletingEventId(eventId);
    try {
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);
      setFlaggedEvents(prev => prev.filter(event => event.id !== eventId));
      setError("Event deleted successfully");
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
    } finally {
      setDeletingEventId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-blue-500" size={24} />
          <span className="text-blue-700">Loading flagged events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Admin Dashboard</h1>

        {error && (
          <div className={`mb-4 p-3 rounded flex justify-between items-center ${
            error.includes("successfully") 
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Flagged Events ({flaggedEvents.length})
          </h2>

          {flaggedEvents.length === 0 ? (
            <div className="text-center py-8 text-blue-700">
              No flagged events to review at this time.
            </div>
          ) : (
            <div className="space-y-6">
              {flaggedEvents.map((event) => (
                <div key={event.id} className="border border-blue-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">
                        {event.title}
                      </h3>
                      <p className="text-sm text-blue-700">
                        Created by: {event.creatorEmail || 'Unknown user'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deletingEventId === event.id}
                      className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingEventId === event.id ? (
                        <Loader className="animate-spin h-5 w-5" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {event.flags.map((flag, index) => (
                      <div key={index} className="bg-orange-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-blue-900">Reason: {flag.reason}</p>
                            <p className="text-sm text-blue-700">
                              Reported by: {flag.userId}
                            </p>
                            <p className="text-sm text-blue-700">
                              Status: <span className={`font-semibold ${
                                flag.status === 'resolved' ? 'text-green-600' :
                                flag.status === 'reviewed' ? 'text-orange-600' :
                                'text-red-600'
                              }`}>{flag.status}</span>
                            </p>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFlagUpdate(event.id, index, 'resolved')}
                              className="p-2 text-green-500 hover:text-green-600"
                              title="Mark as resolved"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleFlagUpdate(event.id, index, 'reviewed')}
                              className="p-2 text-orange-500 hover:text-orange-600"
                              title="Mark as reviewed"
                            >
                              <AlertTriangle size={20} />
                            </button>
                            <button
                              onClick={() => handleFlagUpdate(event.id, index, 'pending')}
                              className="p-2 text-red-500 hover:text-red-600"
                              title="Mark as pending"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;