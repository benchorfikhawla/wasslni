import { redirect } from 'next/navigation';

export default function NotFound() {
  redirect('/error-page/404');
}
