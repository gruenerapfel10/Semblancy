'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginActionState } from '@/lib/auth/actions';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
}

const initialState: LoginActionState = { status: 'idle' };

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [state, formAction] = useActionState<LoginActionState, FormData>(login, initialState);

  useEffect(() => {
    if (state?.status === 'success') {
      router.push('/dashboard/overview');
      router.refresh();
    }
  }, [state?.status, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Get email value from form for potential redirection to check-email
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    if (emailValue) {
      setEmail(emailValue);
    }
  };

  // If login fails because the account isn't confirmed, store the email and provide a special link
  const handleResendVerification = async () => {
    if (email) {
      localStorage.setItem('confirmationEmail', email);
      
      // Optionally, resend the verification email before redirecting
      try {
        await supabase.resendVerificationEmail(email);
      } catch (err) {
        // Silent catch - we'll handle errors on the check-email page
      }
      
      router.push('/check-email');
    }
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      action={formAction} 
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to sign in to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required 
          />
        </div>
        {state?.status === 'failed' && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-500">Invalid email or password</p>
            <p className="text-sm">
              Email not verified?{" "}
              <button 
                type="button"
                onClick={handleResendVerification}
                className="text-primary underline underline-offset-4"
              >
                Resend verification email
              </button>
            </p>
          </div>
        )}
        {state?.status === 'invalid_data' && (
          <p className="text-sm text-red-500">Please enter a valid email and password</p>
        )}
        {state?.status === 'email_not_confirmed' && (
          <div className="rounded-md bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <h3 className="text-sm font-medium">Email not verified</h3>
            <p className="mt-2 text-sm">
              Please verify your email address before signing in. 
              <button 
                type="button"
                onClick={handleResendVerification}
                className="ml-1 font-medium underline underline-offset-4"
              >
                Resend verification email
              </button>
            </p>
          </div>
        )}
        <SubmitButton />
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Sign in with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
