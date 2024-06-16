"use client";

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden">
      <Navbar />
      <section className="flex h-full flex-row">
        <Live />
      </section>
    </main>
  );
};


/// Watched Till 1:45:55