import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Manage your account and application settings here.</p>
    </div>
  );
} 