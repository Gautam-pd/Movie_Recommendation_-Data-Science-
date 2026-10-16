import React from "react";
import { ArrowLeft, RotateCw, Settings, AlertTriangle } from "lucide-react";
import MovieCard from "./MovieCard";

export default function RecommendationFeed({ recommendations, onReset, queryParams }) {
  const { results, era_relaxed, m_param_used, percentile_used, C_used } = recommendations;

  return (
    <div className="space-y-8 py-6">
      {/* Header / Parameter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#081802] pb-6">
        <div className="space-y-1">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-[#77c940] hover:text-[#cdffb8] font-bold transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Adjust Profile Quiz
          </button>
          <h2 className="text-2xl font-extrabold text-[#cdffb8] flex items-center gap-2">
            Your Personalized Feed
          </h2>
          <p className="text-sm text-[#778d7e]">
            Your top 15 movie picks based on your preferences.
          </p>
        </div>
        
        {/* Reset button */}
        <button
          onClick={onReset}
          className="px-4 py-2 bg-[#091f00] hover:bg-[#1f3c0b] border border-[#193d05] text-[#cdffb8] text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <RotateCw className="w-4 h-4" /> Retake Quiz
        </button>
      </div>

      {/* Rec system configuration debug card */}
      <div className="glass-panel p-5 rounded-2xl border border-[#193d05] bg-[#050b05]/95 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <div className="text-xs text-[#778d7e] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-[#77c940]" /> Average Rating
          </div>
          <p className="text-lg font-bold text-[#cdffb8]">{C_used.toFixed(4)}</p>
          <p className="text-[10px] text-[#778d7e]">Across all movies in the catalog</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#778d7e] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-[#68df07]" /> Min. Votes Required
          </div>
          <p className="text-lg font-bold text-[#cdffb8]">{m_param_used.toFixed(1)} ratings</p>
          <p className="text-[10px] text-[#778d7e]">Based on your discovery slider ({percentile_used}%)</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#778d7e] uppercase tracking-wider font-semibold">
            Input Genres & Mood
          </div>
          <p className="text-sm font-bold text-[#cdffb8] truncate">
            {queryParams.genres.join(", ")}
          </p>
          <p className="text-[10px] text-[#778d7e]">Mood: "{queryParams.mood}"</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#778d7e] uppercase tracking-wider font-semibold">
            Era Filter Range
          </div>
          <p className="text-sm font-bold text-[#cdffb8]">
            {queryParams.era}
          </p>
          <p className="text-[10px] text-[#778d7e]">
            {era_relaxed ? (
              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3 shrink-0" /> Relaxed (±10 years)
              </span>
            ) : (
              "Strict search boundary"
            )}
          </p>
        </div>
      </div>

      {/* Warning message for relaxed era search */}
      {era_relaxed && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <div>
            <strong className="font-bold">Heads up:</strong> Not enough movies matched your era filter, so we widened the search by ±10 years to give you better results.
          </div>
        </div>
      )}

      {/* Grid List */}
      {results.length === 0 ? (
        <div className="text-center py-20 bg-[#050b05] rounded-2xl border border-[#193d05]">
          <p className="text-[#778d7e] text-lg">No movies matched the current filters. Please broaden your selection criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((movie) => (
            <MovieCard 
              key={movie.movieId} 
              movie={movie} 
              C_used={C_used} 
              m_param_used={m_param_used} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
