// src/types/admin.ts

import type { User as FirebaseUser } from 'firebase/auth';

export interface AdminUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}