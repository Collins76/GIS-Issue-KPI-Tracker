'use client';

import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set, serverTimestamp, push } from "firebase/database";
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, History } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Write user info to Realtime Database
      const userProfileRef = ref(database, `users/${user.uid}/profile`);
      set(userProfileRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      // Log the session
      const sessionLogRef = ref(database, `users/${user.uid}/sessions`);
      const newSessionRef = push(sessionLogRef);
      set(newSessionRef, {
        loginTime: serverTimestamp(),
      });

    } catch (error: any) {
      console.error('Error signing in with Google', error);
       let errorMessage = 'Sign-in failed. Please try again.';
      // See: https://firebase.google.com/docs/auth/web/handle-errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          // This is a common case, so we can handle it silently
          // by not showing a toast.
          errorMessage = ''; 
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/unauthorized-domain':
           errorMessage = 'This domain is not authorized for sign-in. Please add it to the authorized domains in your Firebase console.';
           break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google Sign-In is not enabled for this project. Please enable it in the Firebase console.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
      }
      
      if (errorMessage) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorMessage,
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out.",
      });
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user.displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/sessions">
              <History className="mr-2 h-4 w-4" />
              <span>Session History</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive hover:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={handleSignIn} variant="secondary" className="hover:bg-primary hover:-translate-y-0.5" disabled={isSigningIn}>
      {isSigningIn ? (
        <>
          <Loader2 className="animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <LogIn />
          Sign In with Google
        </>
      )}
    </Button>
  );
}
