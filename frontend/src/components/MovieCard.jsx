import React, { useState } from "react";
import { Star, Eye, ChevronDown, ChevronUp, Tag } from "lucide-react";
import ScoreBreakdown from "./ScoreBreakdown";

export default function MovieCard({ movie, C_used, m_param_used }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden glass-card-hover border border-slate-800 flex flex-col h-full">
      {/* Poster image */}
      <div className="relative h-64 overflow-hidden bg-slate-950">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        
        {/* Blended Score Badge */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-blue-500/30 px-3 py-1.5 rounded-xl flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Match Score</span>
          <span className="text-base font-extrabold text-blue-400">
            {(movie.final_score * 100).toFixed(1)}%
          </span>
        </div>
        
        {/* Era/Year Badge */}
        {movie.year && (
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700/50">
            {movie.year}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 hover:line-clamp-none transition-all duration-150">
            {movie.title}
          </h3>
          
          {/* Ratings & Votes */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current shrink-0" />
              <span>{movie.avg_rating.toFixed(1)}</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">{movie.vote_count}</span> ratings
            </div>
          </div>

          {/* Matched genres */}
          {movie.matched_genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-blue-400 font-bold mr-1 flex items-center gap-0.5">
                <Tag className="w-3 h-3" /> Matches:
              </span>
              {movie.matched_genres.map((g) => (
                <span 
                  key={g} 
                  className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {/* Genres row */}
          <div className="flex flex-wrap gap-1">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="text-[10px] bg-slate-800 border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded-md"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Overview text */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {movie.overview || "Overview not available."}
          </p>
          
          {/* Explanatory Toggle Button */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 text-slate-400" />
                Hide scoring formula
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-slate-400" />
                Expose recommendation math
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded math breakdown details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-800/80 bg-slate-950/20">
          <ScoreBreakdown 
            movie={movie} 
            C_used={C_used} 
            m_param_used={m_param_used} 
          />
        </div>
      )}
    </div>
  );
}
