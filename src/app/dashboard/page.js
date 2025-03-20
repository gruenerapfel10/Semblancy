import { redirect } from 'next/navigation';

export const metadata = {
  title: "Dashboard | Prosemble",
  description: "Control your projects.",
}

export default function Dashboard() {
  // const firstTime = localStorage.getItem("prosemble-first-time");

  // if (!firstTime) {
    redirect('/dashboard/overview');
  // } else {
    // localStorage.setItem("prosemble-first-time", JSON.stringify("true"));
    // redirect('/dashboard/how-it-works');
  // }
}