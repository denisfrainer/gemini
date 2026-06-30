/*
  app/page.tsx
  Main page, rendering the AvatarGenerator component.
*/

import { Header } from '@/components/Header';
import { AvatarGenerator } from '@/components/AvatarGenerator';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-12 bg-black text-white">
        <AvatarGenerator />
      </main>
      <Footer />
    </>
  );
}
