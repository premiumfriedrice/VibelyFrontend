"use client";

import { VibelyProvider, useVibely } from "@/lib/store";
import Navbar from "@/components/Navbar";
import HistorySidebar from "@/components/HistorySidebar";
import LandingView from "@/components/LandingView";
import SuggestionsView from "@/components/SuggestionsView";
import SearchBar from "@/components/SearchBar";
import LoadingView from "@/components/LoadingView";
import ResultsGrid from "@/components/ResultsGrid";
import DetailModal from "@/components/DetailModal";

function VibelyApp() {
  const { appState } = useVibely();

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <HistorySidebar />

      <main>
        {appState === "empty" && <LandingView />}
        {appState === "typing" && <SuggestionsView />}
        {appState === "loading" && <LoadingView />}
        {appState === "results" && <ResultsGrid />}
      </main>

      <SearchBar />
      <DetailModal />
    </div>
  );
}

export default function Home() {
  return (
    <VibelyProvider>
      <VibelyApp />
    </VibelyProvider>
  );
}
