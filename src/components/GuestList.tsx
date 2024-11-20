// src/components/GuestList.tsx

import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { Guest } from "../types/event";
import { UserPlus, Mail, UserCheck, UserX } from 'lucide-react';

interface GuestListProps {
  eventId: string;
  guests: Guest[];
  onGuestsUpdate: (guests: Guest[]) => void;
}

const GuestList: React.FC<GuestListProps> = ({ eventId, guests, onGuestsUpdate }) => {
  const [newGuest, setNewGuest] = useState({
    email: "",
    role: "",
    notes: "",
  });

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const guest: Guest = {
      userId: "",
      name: "",
      email: newGuest.email,
      role: newGuest.role,
      notes: newGuest.notes,
      rsvpStatus: "pending",
    };

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        guests: arrayUnion(guest),
      });
      onGuestsUpdate([...guests, guest]);
      setNewGuest({ email: "", role: "", notes: "" });
    } catch (error) {
      console.error("Error adding guest:", error);
    }
  };

  const handleUpdateGuest = async (index: number, updatedGuest: Guest) => {
    try {
      const eventRef = doc(db, "events", eventId);
      const newGuests = [...guests];
      await updateDoc(eventRef, {
        guests: arrayRemove(guests[index]),
      });
      await updateDoc(eventRef, {
        guests: arrayUnion(updatedGuest),
      });
      newGuests[index] = updatedGuest;
      onGuestsUpdate(newGuests);
    } catch (error) {
      console.error("Error updating guest:", error);
    }
  };

  const getRsvpStatusColor = (status: Guest["rsvpStatus"]) => {
    switch (status) {
      case "accepted":
        return "text-green-500";
      case "declined":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <UserPlus className="w-6 h-6 mr-2 text-orange-500" />
        Guest List
      </h3>

      <form onSubmit={handleAddGuest} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-blue-700 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
              <input
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                placeholder="Guest Email"
                className="pl-10 w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-orange-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-700 text-sm font-medium mb-2">
              Role
            </label>
            <input
              type="text"
              value={newGuest.role}
              onChange={(e) => setNewGuest({ ...newGuest, role: e.target.value })}
              placeholder="Role (optional)"
              className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-blue-700 text-sm font-medium mb-2">
              Notes
            </label>
            <input
              type="text"
              value={newGuest.notes}
              onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Guest
        </button>
      </form>

      <div className="space-y-4">
        {guests.map((guest, index) => (
          <div
            key={index}
            className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-900">{guest.email}</p>
                {guest.role && (
                  <p className="text-sm text-blue-700">Role: {guest.role}</p>
                )}
                {guest.notes && (
                  <p className="text-sm text-blue-600">Notes: {guest.notes}</p>
                )}
              </div>
              <select
                value={guest.rsvpStatus}
                onChange={(e) =>
                  handleUpdateGuest(index, {
                    ...guest,
                    rsvpStatus: e.target.value as Guest["rsvpStatus"],
                  })
                }
                className={`p-2 border rounded-lg focus:outline-none focus:border-orange-400 ${getRsvpStatusColor(
                  guest.rsvpStatus
                )}`}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        ))}

        {guests.length === 0 && (
          <div className="text-center py-8 text-blue-700">
            No guests added yet. Start by adding guests above.
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestList;