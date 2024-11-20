// src/components/EventDetails.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { Event, Flag } from "../types/event";
import GuestList from "./GuestList";
import FlagDialog from "./FlagDialog";
import { Flag as FlagIcon, Calendar, MapPin, Globe, Lock, AlertTriangle } from 'lucide-react';

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;
    try {
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
      }
    } catch (error) {
      console.error("Error loading event:", error);
      setError("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (reason: string) => {
    if (!event || !user) return;

    setFlagSubmitting(true);
    try {
      // Check if user has already flagged this event
      const hasUserFlagged = event.flags?.some(flag => flag.userId === user.uid);

      if (hasUserFlagged) {
        setError("You have already flagged this event");
        return;
      }

      const newFlag: Flag = {
        userId: user.uid,
        reason,
        timestamp: new Date(),
        status: 'pending'
      };

      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, {
        flags: arrayUnion(newFlag)
      });

      setShowFlagDialog(false);
      // Show success message
      alert("Event has been flagged for review");
    } catch (error) {
      console.error("Error flagging event:", error);
      setError("Failed to flag event");
    } finally {
      setFlagSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="text-blue-700">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl text-orange-500">Event not found</h2>
      </div>
    );
  }

  const isOwner = user?.uid === event.createdBy;
  const hasPendingFlags = event.flags?.some(flag => flag.status === 'pending');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt="Event"
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-blue-900">{event.title}</h1>
            {!isOwner && user && (
              <button
                onClick={() => setShowFlagDialog(true)}
                className="flex items-center text-orange-500 hover:text-orange-600"
                title="Flag this event"
              >
                <FlagIcon className="w-5 h-5 mr-1" />
              </button>
            )}
          </div>

          {hasPendingFlags && isOwner && (
            <div className="mb-4 p-3 bg-orange-100 text-orange-700 rounded flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              This event has been flagged for review
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center text-blue-700">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center text-blue-700">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center text-blue-700">
              {event.isPublic ? (
                <Globe className="w-5 h-5 mr-2" />
              ) : (
                <Lock className="w-5 h-5 mr-2" />
              )}
              <span>{event.isPublic ? "Public Event" : "Private Event"}</span>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Description</h3>
              <p className="text-blue-700">{event.description}</p>
            </div>

            {isOwner && (
              <GuestList
                eventId={event.id}
                guests={event.guests}
                onGuestsUpdate={(updatedGuests) =>
                  setEvent({ ...event, guests: updatedGuests })
                }
              />
            )}
          </div>
        </div>
      </div>

      <FlagDialog
        isOpen={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        onSubmit={handleFlag}
      />
    </div>
  );
};

export default EventDetails;