'use client';

import { useState, useEffect } from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CheckEmailPage() {
  const [email, setEmail] = useState<string>('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Get email from localStorage when component mounts
    const storedEmail = localStorage.getItem('confirmationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Email address not found. Please sign up again.');
      return;
    }
    
    setResendStatus('loading');
    
    try {
      const { error } = await supabase.resendVerificationEmail(email);
      
      if (error) {
        setResendStatus('error');
        setErrorMessage(error.message);
      } else {
        setResendStatus('success');
        setErrorMessage(null);
      }
    } catch (err) {
      setResendStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };
  
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation email to <strong>{email || 'your email address'}</strong>.
                  Please check your inbox and click the link to verify your account.
                </p>
              </div>
              
              {resendStatus === 'success' && (
                <div className="rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900 dark:text-green-100">
                  Confirmation email has been resent successfully!
                </div>
              )}
              
              {resendStatus === 'error' && (
                <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
                  {errorMessage || 'Failed to resend confirmation email.'}
                </div>
              )}
              
              <Button
                onClick={handleResend}
                disabled={resendStatus === 'loading'}
                className="w-full"
              >
                {resendStatus === 'loading' ? 'Sending...' : 'Resend confirmation email'}
              </Button>
              
              <div className="flex flex-col gap-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder.
                </p>
                <p className="text-muted-foreground">
                  Already confirmed? <Link href="/login" className="text-primary underline underline-offset-4">Sign in</Link>
                </p>
                <p className="text-muted-foreground">
                  Need to change your email? <Link href="/signup" className="text-primary underline underline-offset-4">Sign up again</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
} 