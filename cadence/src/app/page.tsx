import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware handles auth — if the user reaches here they're authenticated.
  // Redirect to the main app; unauthenticated visitors are caught by middleware → /login.
  redirect('/schedule');
}
