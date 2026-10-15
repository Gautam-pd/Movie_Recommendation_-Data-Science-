import React from "react";
import { ArrowLeft, RotateCw, Settings, AlertTriangle } from "lucide-react";
import MovieCard from "./MovieCard";

export default function RecommendationFeed({ recommendations, onReset, queryParams }) {
  const { results, era_relaxed, m_param_used, percentile_used, C_used } = recommendations;

  return (
    <div className="space-y-8 py-6">
      {/* Header / Parameter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Adjust Profile Quiz
          </button>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            🍿 Your Personalized Feed
          </h2>
          <p className="text-sm text-slate-400">
            Top 15 recommendations computed dynamically using TF-IDF & Bayesian weighted rating.
          </p>
        </div>
        
        {/* Reset button */}
        <button
          onClick={onReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <RotateCw className="w-4 h-4" /> Retake Quiz
        </button>
      </div>

      {/* Rec system configuration debug card */}
      <div className="glass-panel p-5 rounded-2xl border border-blue-500/20 bg-blue-950/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-blue-400" /> C (Global Mean Rating)
          </div>
          <p className="text-lg font-bold text-slate-100">{C_used.toFixed(4)}</p>
          <p className="text-[10px] text-slate-500">Calculated over all dataset ratings</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-indigo-400" /> m_param (Vote Cutoff)
          </div>
          <p className="text-lg font-bold text-slate-100">{m_param_used.toFixed(1)} ratings</p>
          <p className="text-[10px] text-slate-500">Set at the {percentile_used}% vote percentile</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Input Genres & Mood
          </div>
          <p className="text-sm font-bold text-slate-200 truncate">
            {queryParams.genres.join(", ")}
          </p>
          <p className="text-[10px] text-slate-500">Mood: "{queryParams.mood}" (+0.5 weight)</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Era Filter Range
          </div>
          <p className="text-sm font-bold text-slate-200">
            {queryParams.era}
          </p>
          <p className="text-[10px] text-slate-500">
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
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <div>
            <strong className="font-bold">Transparency Alert:</strong> The requested era filters yielded fewer than 20 candidate matches. 
            To prevent return starvation, the engine automatically relaxed the release boundaries by ±10 years.
          </div>
        </div>
      )}

      {/* Grid List */}
      {results.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-lg">No movies matched the current filters. Please broaden your selection criteria.</p>
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
