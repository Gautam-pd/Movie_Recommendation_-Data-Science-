import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getGenres } from "../api";

export default function GenreQuiz({ onSubmit, isLoading }) {
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [mood, setMood] = useState("Thought-provoking");
  const [era, setEra] = useState("Any");
  const [sliderVal, setSliderVal] = useState(50);
  const [error, setError] = useState("");
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    getGenres()
      .then((data) => {
        setAvailableGenres(data.genres);
        setLoadingGenres(false);
      })
      .catch((err) => {
        console.error("Failed to load genres:", err);
        setError("Could not connect to recommendation engine. Make sure the backend is running.");
        setLoadingGenres(false);
      });
  }, []);

  const handleGenreToggle = (genre) => {
    setError("");
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length >= 5) {
        setError("You can select up to 5 genres.");
        return;
      }
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const getPercentileUsed = (val) => {
    return Math.round(30 + val * 0.6);
  };

  const getSliderExplanation = (val) => {
    const pct = getPercentileUsed(val);
    if (val < 25) {
      return `Hidden Gems Mode: Will search for lesser-known, highly rated movies (vote counts above the ${pct}th percentile).`;
    }
    if (val > 75) {
      return `Crowd Favorites Mode: Will strictly recommend blockbuster hits with substantial ratings (vote counts above the ${pct}th percentile).`;
    }
    return `Balanced Mode: Blends popular blockbusters and niche releases (vote counts above the ${pct}th percentile).`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGenres.length < 2) {
      setError("Please select at least 2 genres (up to 5).");
      return;
    }
    setError("");
    onSubmit({
      genres: selectedGenres,
      mood,
      era,
      gem_slider: Number(sliderVal),
    });
  };

  if (loadingGenres) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-[#77c940] w-12 h-12 mb-4" />
        <p className="text-slate-400 text-lg">Loading available genres...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#061205] border border-[#142f0c] text-[#8ea894] text-xs font-medium tracking-wider uppercase">
          Recommendation Profiler
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Personalize Your Recommendations
        </h2>
        <p className="text-[#778d7e] max-w-xl mx-auto text-base">
          Tell us what you like and we'll find movies you'll love.
        </p>
      </div>

      {error && (
        <div className="glass-panel border-red-500/30 bg-red-950/20 text-red-300 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Question 1: Genres */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#081802] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#e0eedb] flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0e240a] border border-[#1c4514] text-[#8ea894] text-xs font-mono font-bold">1</span>
              Primary Genres
            </h3>
            <p className="text-xs text-[#778d7e] mt-1">Select 2 to 5 genres you enjoy</p>
          </div>
          <span className="text-xs font-mono bg-[#061205] border border-[#142f0c] px-2.5 py-1 rounded-lg text-[#778d7e]">
            Selected: {selectedGenres.length} / 5
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5 pt-2">
          {availableGenres.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#183d0c] border-[#2d6b1d] text-[#e0ffd1] font-semibold"
                    : "bg-[#050b05] border-[#0e210a] text-[#8ea894] hover:bg-[#091806] hover:border-[#1c4514] hover:text-[#cdffb8]"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 2: Mood */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#e0eedb] flex items-center gap-2 border-b border-[#081802] pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0e240a] border border-[#1c4514] text-[#8ea894] text-xs font-mono font-bold">2</span>
            What's the mood right now?
          </h3>
          <p className="text-xs text-[#778d7e] mt-1.5">Pick a vibe to help refine your results</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { id: "Light & Fun", desc: "Comedy, Animation, Adventure" },
            { id: "Intense & Gripping", desc: "Thriller, Mystery, Crime, Film-Noir" },
            { id: "Thought-provoking", desc: "Sci-Fi, Drama, Documentary, War" }
          ].map((item) => {
            const isSelected = mood === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMood(item.id)}
                className={`p-5 text-left rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#183d0c] border-[#2d6b1d] text-white font-semibold"
                    : "bg-[#050b05] border-[#0e210a] text-[#8ea894] hover:bg-[#091806] hover:border-[#1c4514] hover:text-[#cdffb8]"
                }`}
              >
                <span className="font-bold text-base">{item.id}</span>
                <span className={`text-xs mt-3 ${isSelected ? "text-[#cdffb8]" : "text-[#778d7e]"}`}>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 3: Era */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#e0eedb] flex items-center gap-2 border-b border-[#081802] pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0e240a] border border-[#1c4514] text-[#8ea894] text-xs font-mono font-bold">3</span>
            Release Era Preference
          </h3>
          <p className="text-xs text-[#778d7e] mt-1.5">Choose a time period for your recommendations</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { id: "Classics (pre-2000)", label: "Pre-2000 Classics" },
            { id: "Modern (2000–2015)", label: "2000 - 2015 Moderns" },
            { id: "Recent (2015+)", label: "2015+ Recent Era" },
            { id: "Any", label: "No Era Limits (All)" }
          ].map((item) => {
            const isSelected = era === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setEra(item.id)}
                className={`p-4 text-center rounded-xl border text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-[#183d0c] border-[#2d6b1d] text-[#e0ffd1] font-semibold"
                    : "bg-[#050b05] border-[#0e210a] text-[#8ea894] hover:bg-[#091806] hover:border-[#1c4514] hover:text-[#cdffb8]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 4: Hidden Gems ↔ Crowd Favorites Slider */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-5">
        <div>
          <h3 className="text-lg font-bold text-[#e0eedb] flex items-center gap-2 border-b border-[#081802] pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0e240a] border border-[#1c4514] text-[#8ea894] text-xs font-mono font-bold">4</span>
            Discovery Mode
          </h3>
          <p className="text-xs text-[#778d7e] mt-1.5">
            Slide left for hidden gems, or right for popular crowd favorites.
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center text-sm font-mono">
            <span className="text-[#778d7e]">Hidden Gems</span>
            <span className="text-[#a5d98d] font-semibold bg-[#071304] border border-[#183d0c] px-2.5 py-0.5 rounded-lg text-base">
              {sliderVal}%
            </span>
            <span className="text-[#778d7e]">Crowd Favorites</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => setSliderVal(e.target.value)}
            className="w-full h-2 rounded-lg bg-[#071304] accent-[#2d6b1d] border border-[#12280a] focus:outline-none cursor-pointer"
          />
          <div className="glass-panel border-[#193d05] bg-[#050b05] p-4 rounded-xl">
            <p className="text-sm text-[#8ea894] leading-relaxed font-sans">
              {getSliderExplanation(sliderVal)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 bg-[#1b4e09] hover:bg-[#23630c] text-white rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 border border-[#2b7512] disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Finding your movies...
            </>
          ) : (
            "Generate Recommendations"
          )}
        </button>
      </div>
    </form>
  );
}
