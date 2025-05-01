'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabase as supabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data' | 'email_not_confirmed';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('Please verify your email')) {
        return { status: 'email_not_confirmed' };
      }
      return { status: 'failed' };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data' | 'user_exists';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { status: 'user_exists' };
      }
      return { status: 'failed' };
    }

    if (data?.user) {
      return { status: 'success' };
    }

    return { status: 'failed' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
