// src/components/CreateEditEvent.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { Event } from "../types/event";
import { Loader } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  isPublic: boolean;
}

const CreateEditEvent: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    location: "",
    isPublic: false,
  });

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const eventDoc = await getDoc(doc(db, "events", eventId!));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as Event;
        setFormData({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          isPublic: eventData.isPublic,
        });
      }
    } catch (error) {
      console.error("Error loading event:", error);
      setError("Failed to load event data");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImage(selectedFile);
    }
  };

  const uploadImage = async (userId: string): Promise<string> => {
    if (!image) return "";

    try {
      // Create a reference to the file location
      const imageRef = ref(storage, `events/${userId}/${Date.now()}_${image.name}`);

      // Upload the file
      const snapshot = await uploadBytes(imageRef, image);
      console.log("Image uploaded successfully");

      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log("Image URL obtained:", downloadUrl);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to create events");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";
      if (image) {
        try {
          imageUrl = await uploadImage(user.uid);
        } catch (error) {
          setError("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      const eventData = {
        ...formData,
        imageUrl,
        createdBy: user.uid,
        creatorEmail: user.email,
        guests: [],
        flags: [],
        updatedAt: serverTimestamp(),
      };

      let savedEventId: string;

      if (eventId) {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, eventData);
        savedEventId = eventId;
      } else {
        const eventRef = await addDoc(collection(db, "events"), {
          ...eventData,
          createdAt: serverTimestamp(),
        });
        savedEventId = eventRef.id;
      }

      navigate(`/event/${savedEventId}`);
    } catch (error) {
      console.error("Error saving event:", error);
      setError("Failed to save event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen">
      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">
            {eventId ? "Edit Event" : "Create New Event"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-blue-800">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-blue-800">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-blue-800">Date</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-blue-800">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-blue-800">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="mr-2 text-orange-500 focus:ring-orange-500"
                />
                Make this event public
              </label>
            </div>

            <div>
              <label className="block mb-2 text-blue-800">Event Image (Max 5MB)</label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:bg-orange-300"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Saving...
                </span>
              ) : (
                eventId ? "Update Event" : "Create Event"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditEvent;