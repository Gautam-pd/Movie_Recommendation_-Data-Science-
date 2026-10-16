import React from "react";
import { Info, HelpCircle } from "lucide-react";

export default function ScoreBreakdown({ movie, C_used, m_param_used }) {
  const simContribution = movie.genre_similarity * 0.6;
  const qualContribution = movie.quality_score * 0.4;
  
  return (
    <div className="bg-[#050b05] border border-[#193d05] p-4 sm:p-5 rounded-2xl space-y-4 text-xs font-mono mt-3">
      <div className="flex items-center gap-1.5 text-[#77c940] font-bold border-b border-[#081802] pb-2">
        <Info className="w-4 h-4 shrink-0" /> Recommendation Math Breakdown
      </div>
      
      {/* Formula summary */}
      <div className="bg-black p-3 rounded-xl border border-[#193d05] space-y-1">
        <div className="text-[#778d7e] font-semibold">Blended Score Formula:</div>
        <div className="text-[#cdffb8] overflow-x-auto whitespace-nowrap">
          Score = (0.6 × GenreSimilarity) + (0.4 × QualityScore)
        </div>
        <div className="text-[#778d7e] mt-2 font-semibold">Your Movie Calculation:</div>
        <div className="text-[#cdffb8] font-bold overflow-x-auto whitespace-nowrap">
          {movie.final_score.toFixed(4)} = (0.6 × {movie.genre_similarity.toFixed(4)}) + (0.4 × {movie.quality_score.toFixed(4)})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Genre Similarity component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#cdffb8]">1. Genre Similarity (60% Weight)</span>
            <span className="text-[#a5d98d] font-bold">{(simContribution).toFixed(4)}</span>
          </div>
          <div className="space-y-1 text-[11px] text-[#778d7e]">
            <p>• Cosine similarity between your vector & movie vector: <strong className="text-[#cdffb8]">{movie.genre_similarity.toFixed(4)}</strong></p>
            <p>• Matches: <strong className="text-[#a5d98d]">[{movie.matched_genres.join(", ") || "None"}]</strong></p>
            <p>• Math: <code className="bg-black px-1 rounded text-[#cdffb8]">cos(θ) = (A • B) / (||A|| ||B||)</code></p>
          </div>
          {/* Similarity bar */}
          <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-[#193d05]">
            <div 
              className="bg-[#2f751a] h-full rounded-full" 
              style={{ width: `${movie.genre_similarity * 100}%` }}
            />
          </div>
        </div>

        {/* Quality Score component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#cdffb8]">2. Quality Score (40% Weight)</span>
            <span className="text-[#a5d98d] font-bold">{(qualContribution).toFixed(4)}</span>
          </div>
          <div className="space-y-1 text-[11px] text-[#778d7e]">
            <p>• Precomputed global mean (C): <strong className="text-[#cdffb8]">{C_used.toFixed(4)}</strong></p>
            <p>• Vote count requirement (m): <strong className="text-[#cdffb8]">{m_param_used.toFixed(1)}</strong> ratings</p>
            <p>• Movie ratings: <strong className="text-[#cdffb8]">{movie.vote_count}</strong> votes | Avg: <strong className="text-[#cdffb8]">{movie.avg_rating.toFixed(2)}</strong></p>
            <p>• Weighted Rating (WR) calculated: <strong className="text-[#cdffb8]">{movie.weighted_rating.toFixed(4)}</strong></p>
            <p>• Min-Max normalisation across candidates: <strong className="text-[#a5d98d]">{movie.quality_score.toFixed(4)}</strong></p>
          </div>
          {/* Quality bar */}
          <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-[#193d05]">
            <div 
              className="bg-[#246313] h-full rounded-full" 
              style={{ width: `${movie.quality_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weighted Rating Formula display */}
      <div className="bg-black p-3 rounded-xl border border-[#193d05] text-[10px] text-[#778d7e] space-y-1">
        <div className="font-bold text-[#cdffb8]">Bayesian Weighted Rating (IMDB Formula):</div>
        <code className="block text-[#cdffb8] py-1 overflow-x-auto whitespace-nowrap">
          WR = [v / (v + m)] × R + [m / (v + m)] × C
        </code>
        <div className="pt-1">
          WR = [{movie.vote_count} / ({movie.vote_count} + {m_param_used})] × {movie.avg_rating} + [{m_param_used} / ({movie.vote_count} + {m_param_used})] × {C_used.toFixed(4)} = <strong className="text-[#a5d98d]">{movie.weighted_rating.toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
}
