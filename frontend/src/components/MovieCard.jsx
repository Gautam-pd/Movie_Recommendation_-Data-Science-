import React, { useState } from "react";
import { Star, Eye, ChevronDown, ChevronUp, Tag } from "lucide-react";
import ScoreBreakdown from "./ScoreBreakdown";

export default function MovieCard({ movie, C_used, m_param_used }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden glass-card-hover border border-[#081802] flex flex-col h-full bg-[#050b05]">
      {/* Poster image */}
      <div className="relative h-64 overflow-hidden bg-black">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        
        {/* Blended Score Badge */}
        <div className="absolute top-4 right-4 bg-[#050b05]/95 backdrop-blur border border-[#2f6f1c] px-3 py-1.5 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-[#778d7e] font-semibold uppercase tracking-wider">Match Score</span>
          <span className="text-base font-extrabold text-[#a5d98d]">
            {(movie.final_score * 100).toFixed(1)}%
          </span>
        </div>
        
        {/* Era/Year Badge */}
        {movie.year && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-2.5 py-1 rounded-xl text-xs font-semibold text-[#cdffb8] border border-[#193d05]">
            {movie.year}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#cdffb8] line-clamp-1 hover:line-clamp-none transition-all duration-150">
            {movie.title}
          </h3>
          
          {/* Ratings & Votes */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current shrink-0" />
              <span>{movie.avg_rating.toFixed(1)}</span>
            </div>
            <span className="text-[#193d05]">|</span>
            <div className="text-[#778d7e] text-xs">
              <span className="font-semibold text-[#cdffb8]">{movie.vote_count}</span> ratings
            </div>
          </div>

          {/* Matched genres */}
          {movie.matched_genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#a5d98d] font-bold mr-1 flex items-center gap-0.5">
                <Tag className="w-3 h-3" /> Matches:
              </span>
              {movie.matched_genres.map((g) => (
                <span 
                  key={g} 
                  className="text-[10px] bg-[#0e240a] border border-[#1c4514] text-[#a5d98d] px-2 py-0.5 rounded-lg font-medium"
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
                className="text-[10px] bg-[#091f00] border border-[#193d05] text-[#778d7e] px-2 py-0.5 rounded-lg"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Overview text */}
          <p className="text-xs text-[#778d7e] line-clamp-2 leading-relaxed">
            {movie.overview || "Overview not available."}
          </p>
          
          {/* Explanatory Toggle Button */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 bg-[#091f00]/70 hover:bg-[#091f00] border border-[#193d05] hover:border-[#2d6e11] rounded-xl text-xs font-semibold text-[#cdffb8] transition-colors flex items-center justify-center gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 text-[#778d7e]" />
                Hide scoring formula
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-[#778d7e]" />
                Expose recommendation math
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded math breakdown details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#081802] bg-black/40">
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
