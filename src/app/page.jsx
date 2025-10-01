// src/app/page.jsx
import {redirect} from 'next/navigation';

export default function RootRedirect() {
  redirect('/tr'); // varsayılan dilini değiştir: /en, /de, ...
}
