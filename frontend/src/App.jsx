import React, { useState } from "react";
import { Sparkles, Film, BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import GenreQuiz from "./components/GenreQuiz";
import RecommendationFeed from "./components/RecommendationFeed";
import InsightsDashboard from "./components/InsightsDashboard";
import { getRecommendations } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("quiz"); // quiz, feed, insights
  const [recommendations, setRecommendations] = useState(null);
  const [queryParams, setQueryParams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuizSubmit = async (params) => {
    setIsLoading(true);
    setError("");
    setQueryParams(params);

    try {
      const data = await getRecommendations(params);
      setRecommendations(data);
      setActiveTab("feed");
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
      setError("Recommendation generation failed. Ensure your FastAPI server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendations(null);
    setQueryParams(null);
    setActiveTab("quiz");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/10">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                PopcornStats <span className="text-xs text-blue-400 font-mono font-semibold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">Demo</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Explainable Recommendation Engine</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => {
                if (recommendations) {
                  setActiveTab("feed");
                } else {
                  setActiveTab("quiz");
                }
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "quiz" || activeTab === "feed"
                  ? "bg-slate-800 text-blue-400 border border-slate-700/60 shadow-lg shadow-blue-500/5"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" /> Recommender
            </button>
            
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "insights"
                  ? "bg-slate-800 text-indigo-400 border border-slate-700/60 shadow-lg shadow-indigo-500/5"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Insights
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="glass-panel border-red-500/30 bg-red-950/20 text-red-300 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Dynamic Tab Switch */}
        {activeTab === "quiz" && (
          <GenreQuiz onSubmit={handleQuizSubmit} isLoading={isLoading} />
        )}
        
        {activeTab === "feed" && recommendations && (
          <RecommendationFeed 
            recommendations={recommendations} 
            queryParams={queryParams} 
            onReset={handleReset} 
          />
        )}
        
        {activeTab === "insights" && (
          <InsightsDashboard recommendations={recommendations} />
        )}
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            PopcornStats is an educational data-analysis portfolio demonstration.
          </p>
          <p>
            Data sourced from <a href="https://grouplens.org/datasets/movielens/" target="_blank" rel="noreferrer" className="text-slate-400 hover:underline">MovieLens</a> & optional poster metadata via <a href="https://themoviedb.org" target="_blank" rel="noreferrer" className="text-slate-400 hover:underline">TMDB API</a>.
          </p>
        </div>
      </footer>

    </div>
  );
}
