import React, { useState, useEffect } from "react";
import { Sparkles, Compass, AlertCircle, RefreshCw } from "lucide-react";
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
      setError("Please select at least 2 primary genres (up to 5) to help fine-tune the TF-IDF matching.");
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
        <RefreshCw className="animate-spin text-blue-500 w-12 h-12 mb-4" />
        <p className="text-slate-400 text-lg">Retrieving dynamic genre vocabulary from dataset...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="w-4 h-4" /> Interactive Profiler
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
          Personalize Your Recommendations
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-base">
          Configure the underlying content vectorizer and statistical Bayesian smoothing weights to generate math-backed recommendations.
        </p>
      </div>

      {error && (
        <div className="glass-panel border-red-500/30 bg-red-950/20 text-red-300 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Question 1: Genres */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 text-sm font-mono">1</span>
              Primary Genres
            </h3>
            <p className="text-xs text-slate-400 mt-1">Sets the primary target tokens for TF-IDF content similarity (Select 2 to 5)</p>
          </div>
          <span className="text-xs font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-400">
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
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 hover:scale-[1.03] ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
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
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 text-sm font-mono">2</span>
            What's the mood right now?
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">Maps secondary genres added to the user-preference vector at half-weight (0.5)</p>
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
                    ? "bg-indigo-600/90 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <span className="font-bold text-base">{item.id}</span>
                <span className={`text-xs mt-3 ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
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
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 text-sm font-mono">3</span>
            Release Era Preference
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">Filters candidates by release year range (relaxes range dynamically by ±10 years if needed)</p>
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
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
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
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-700/50 pb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 text-sm font-mono">4</span>
            Discovery Mode
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            Sets the minimum-vote threshold percentile (<code className="text-blue-400 font-mono">m_param</code>). Allows low-vote gems to compete vs. requiring crowd-fav popularity blockbusters.
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center text-sm font-mono">
            <span className="text-slate-400">Hidden Gems</span>
            <span className="text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-lg">
              {sliderVal}%
            </span>
            <span className="text-slate-400">Crowd Favorites</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => setSliderVal(e.target.value)}
            className="w-full h-2 rounded-lg bg-slate-800 accent-blue-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div className="glass-panel border-blue-500/20 bg-blue-950/10 p-4 rounded-xl">
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {getSliderExplanation(sliderVal)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Recalculating score matrices...
            </>
          ) : (
            <>
              <Compass className="w-5 h-5" />
              Generate Recommendation Feed
            </>
          )}
        </button>
      </div>
    </form>
  );
}
