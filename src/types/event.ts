// src/types/event.ts

export interface Flag {
  userId: string;
  reason: string;
  timestamp: any; // Firebase Timestamp
  status: 'pending' | 'reviewed' | 'resolved';
  updatedAt?: any; // Making updatedAt optional
}

export interface Guest {
  userId: string;
  name: string;
  email: string;
  role?: string;
  rsvpStatus: 'pending' | 'accepted' | 'declined';
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  location: string;
  createdBy: string;
  creatorEmail?: string; // Making creatorEmail optional
  isPublic: boolean;
  guests: Guest[];
  flags: Flag[];
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
}