import React from "react";
import { Info, HelpCircle } from "lucide-react";

export default function ScoreBreakdown({ movie, C_used, m_param_used }) {
  const simContribution = movie.genre_similarity * 0.6;
  const qualContribution = movie.quality_score * 0.4;
  
  return (
    <div className="bg-slate-900/90 border border-slate-700/50 p-4 sm:p-5 rounded-xl space-y-4 text-xs font-mono mt-3">
      <div className="flex items-center gap-1.5 text-blue-400 font-bold border-b border-slate-800 pb-2">
        <Info className="w-4 h-4 shrink-0" /> Recommendation Math Breakdown
      </div>
      
      {/* Formula summary */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
        <div className="text-slate-400 font-semibold">Blended Score Formula:</div>
        <div className="text-slate-200 overflow-x-auto whitespace-nowrap">
          Score = (0.6 × GenreSimilarity) + (0.4 × QualityScore)
        </div>
        <div className="text-slate-400 mt-2 font-semibold">Your Movie Calculation:</div>
        <div className="text-slate-100 font-bold overflow-x-auto whitespace-nowrap">
          {movie.final_score.toFixed(4)} = (0.6 × {movie.genre_similarity.toFixed(4)}) + (0.4 × {movie.quality_score.toFixed(4)})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Genre Similarity component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">1. Genre Similarity (60% Weight)</span>
            <span className="text-blue-400 font-bold">{(simContribution).toFixed(4)}</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <p>• Cosine similarity between your vector & movie vector: <strong className="text-slate-200">{movie.genre_similarity.toFixed(4)}</strong></p>
            <p>• Matches: <strong className="text-blue-400">[{movie.matched_genres.join(", ") || "None"}]</strong></p>
            <p>• Math: <code className="bg-slate-950 px-1 rounded text-slate-300">cos(θ) = (A • B) / (||A|| ||B||)</code></p>
          </div>
          {/* Similarity bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-blue-500 h-full rounded-full" 
              style={{ width: `${movie.genre_similarity * 100}%` }}
            />
          </div>
        </div>

        {/* Quality Score component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">2. Quality Score (40% Weight)</span>
            <span className="text-indigo-400 font-bold">{(qualContribution).toFixed(4)}</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <p>• Precomputed global mean (C): <strong className="text-slate-200">{C_used.toFixed(4)}</strong></p>
            <p>• Vote count requirement (m): <strong className="text-slate-200">{m_param_used.toFixed(1)}</strong> ratings</p>
            <p>• Movie ratings: <strong className="text-slate-200">{movie.vote_count}</strong> votes | Avg: <strong className="text-slate-200">{movie.avg_rating.toFixed(2)}</strong></p>
            <p>• Weighted Rating (WR) calculated: <strong className="text-slate-200">{movie.weighted_rating.toFixed(4)}</strong></p>
            <p>• Min-Max normalisation across candidates: <strong className="text-indigo-300">{movie.quality_score.toFixed(4)}</strong></p>
          </div>
          {/* Quality bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-indigo-500 h-full rounded-full" 
              style={{ width: `${movie.quality_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weighted Rating Formula display */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1">
        <div className="font-bold text-slate-300">Bayesian Weighted Rating (IMDB Formula):</div>
        <code className="block text-slate-200 py-1 overflow-x-auto whitespace-nowrap">
          WR = [v / (v + m)] × R + [m / (v + m)] × C
        </code>
        <div className="pt-1">
          WR = [{movie.vote_count} / ({movie.vote_count} + {m_param_used})] × {movie.avg_rating} + [{m_param_used} / ({movie.vote_count} + {m_param_used})] × {C_used.toFixed(4)} = <strong className="text-green-400">{movie.weighted_rating.toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
}
