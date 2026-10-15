import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Label
} from "recharts";
import { Database, BarChart3, ScatterChart as ScatterIcon, ShieldQuestion, HelpCircle, Activity } from "lucide-react";
import { getInsights } from "../api";

export default function InsightsDashboard({ recommendations }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInsights()
      .then((data) => {
        setInsights(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load insights:", err);
        setError("Could not load insights statistics. Ensure build_dataset.py and eda.py have run.");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
        <p className="text-slate-400">Loading dataset distribution statistics...</p>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="glass-panel p-6 rounded-2xl border-red-500/30 text-center max-w-xl mx-auto my-10 space-y-4">
        <p className="text-red-400">{error || "Insights dashboard unavailable."}</p>
        <p className="text-xs text-slate-400">
          Make sure to run <code className="bg-slate-950 px-1 rounded text-red-300">python -m backend.analysis.eda</code> on the server to precompute the dashboard data.
        </p>
      </div>
    );
  }

  // Format Genre Counts for Recharts
  const genreChartData = Object.entries(insights.genre_counts)
    .map(([genre, count]) => ({ genre, count }))
    .slice(0, 10); // Show top 10 for clean spacing

  // Format Rating Histogram for Recharts
  const ratingChartData = insights.rating_histogram.bins.map((bin, index) => ({
    rating: bin.toFixed(1),
    count: insights.rating_histogram.counts[index]
  }));

  // Scatter plot data mapping
  // Build a list of recommended movieIds for easy checking
  const recommendedIds = new Set(
    recommendations ? recommendations.results.map(r => r.movieId) : []
  );

  // Background catalog scatter data (excluding active recommendations to prevent duplicate overlay)
  const catalogScatter = insights.vote_vs_rating_sample
    .filter(item => !recommendedIds.has(item.movieId))
    .map(item => ({
      ...item,
      type: "Catalog Movie",
      size: 4
    }));

  // Recommended movies scatter data
  const recommendedScatter = recommendations
    ? recommendations.results.map(movie => ({
        movieId: movie.movieId,
        title: movie.title,
        vote_count: movie.vote_count,
        avg_rating: movie.avg_rating,
        type: "Recommended Movie",
        size: 15
      }))
    : [];

  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg font-mono text-xs shadow-2xl">
          <p className="font-bold text-slate-200">{data.title}</p>
          <p className="text-slate-400 mt-1">Avg Rating: <span className="text-slate-200">{data.avg_rating.toFixed(2)}</span></p>
          <p className="text-slate-400">Vote Count: <span className="text-slate-200">{data.vote_count}</span></p>
          <p className={`font-semibold mt-1.5 ${data.type === "Recommended Movie" ? "text-cyan-400" : "text-slate-500"}`}>
            {data.type}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-500" /> Dataset Insights & Math Parameters
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Explore the statistical structure of the MovieLens catalog and inspect dynamic mathematical values.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Catalog Movies</p>
            <p className="text-2xl font-black text-slate-100">
              {insights.dataset_summary.num_movies.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Ratings</p>
            <p className="text-2xl font-black text-slate-100">
              {insights.dataset_summary.num_ratings.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unique Reviewers</p>
            <p className="text-2xl font-black text-slate-100">
              {insights.dataset_summary.num_users.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Global Average C</p>
            <p className="text-2xl font-black text-slate-100">
              {insights.C_global_mean.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Distributions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Frequency */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200">Top 10 Genres in MovieLens</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="genre" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#F8FAFC", fontFamily: "monospace" }} 
                  itemStyle={{ color: "#60A5FA" }}
                />
                <Bar dataKey="count" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200">Global Ratings Frequencies Histogram</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="rating" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#F8FAFC", fontFamily: "monospace" }} 
                  itemStyle={{ color: "#A78BFA" }}
                />
                <Bar dataKey="count" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#5B21B6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catalog Distribution Scatter plot with overlay highlights */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <ScatterIcon className="w-5 h-5 text-cyan-400" /> Ratings vs. Vote Counts Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            This scatter plot contrasts the average rating (X-axis) against the total vote count (Y-axis) for top movies.
            {recommendations && (
              <span className="text-cyan-400 font-bold ml-1">
                Your 15 recommendations are mapped in neon blue to illustrate their relative ranking.
              </span>
            )}
          </p>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid stroke="#1E293B" />
              <XAxis 
                type="number" 
                dataKey="avg_rating" 
                name="avg_rating" 
                domain={[0.5, 5.0]} 
                stroke="#94A3B8" 
                fontSize={10} 
                tickLine={false}
              >
                <Label value="Average Rating (R)" offset={-10} position="insideBottom" stroke="#94A3B8" fontSize={11} />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="vote_count" 
                name="vote_count" 
                stroke="#94A3B8" 
                fontSize={10} 
                tickLine={false}
              >
                <Label value="Vote Count (v)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} stroke="#94A3B8" fontSize={11} />
              </YAxis>
              <ZAxis type="number" dataKey="size" range={[20, 150]} />
              <Tooltip content={<CustomScatterTooltip />} />
              
              {/* Background movies */}
              <Scatter 
                name="Catalog Catalog" 
                data={catalogScatter} 
                fill="#475569" 
                fillOpacity={0.4} 
              />
              
              {/* Highlighted recommendations */}
              {recommendedScatter.length > 0 && (
                <Scatter 
                  name="Your Recommendations" 
                  data={recommendedScatter} 
                  fill="#22D3EE" 
                  stroke="#0891B2"
                  strokeWidth={2}
                  fillOpacity={0.9} 
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanatory Math Info Panel */}
      <div className="glass-panel p-6 rounded-2xl bg-indigo-950/15 border border-indigo-500/20 space-y-4">
        <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
          <ShieldQuestion className="w-5 h-5" /> Explaining the Analytical Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed font-sans">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200">1. TF-IDF Genre Vectorization</h4>
            <p>
              Rather than matching genres as arbitrary labels, the recommender fits a Term Frequency-Inverse Document Frequency (TF-IDF) vectorizer. 
              Genres that are rare across the dataset (e.g. <i>Film-Noir</i>, <i>IMAX</i>) carry higher weighting. 
              The user profile builds a matching vector (giving primary genres weight 1.0, secondary mood genres 0.5) and projects it into the shared TF-IDF space. 
              Cosine similarity is then calculated to score matching features.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200">2. Bayesian Quality Smoothing</h4>
            <p>
              Simple average ratings are highly volatile for movies with low vote counts (a movie with one 5.0 rating shouldn't beat a movie with 500 reviews averaging 4.8). 
              We calculate an <b>IMDB Weighted Rating (WR)</b>, which acts as a Bayesian average. 
              The minimum vote cutoff <code className="text-indigo-400 font-mono">m</code> is calculated dynamically based on your slider selection (percentiles 30% to 90%). 
              This rating is min-max normalized across candidates, and combined with genre matching using a 60/40 blend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
