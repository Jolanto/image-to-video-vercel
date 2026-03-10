"use client";

import { useEffect, useState } from "react";
import { Users, Upload, Download, Share2, Globe, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ReportData {
  totalVisitors: number;
  actions: {
    visit: number;
    upload: number;
    download: number;
    share: number;
  };
  sources: {
    source: string;
    count: number;
  }[];
}

export default function Dashboard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-brand-500">
        <Activity className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-8 text-center">
        <p className="text-xl font-medium mb-4">Error loading dashboard: {error}</p>
        <Link href="/" className="text-brand-500 hover:text-brand-400 underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-50 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">Track user engagement and system usage across your application.</p>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Visitors" 
            value={data.totalVisitors.toString()} 
            icon={<Users className="w-6 h-6 text-blue-400" />}
            trend="+12%"
          />
          <StatCard 
            title="Total Uploads" 
            value={data.actions.upload.toString()} 
            icon={<Upload className="w-6 h-6 text-brand-400" />}
            trend="Stable"
          />
          <StatCard 
            title="Total Downloads" 
            value={data.actions.download.toString()} 
            icon={<Download className="w-6 h-6 text-emerald-400" />}
            trend="+5%"
          />
          <StatCard 
            title="Total Shares" 
            value={data.actions.share.toString()} 
            icon={<Share2 className="w-6 h-6 text-pink-400" />}
            trend="+2%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Breakdown */}
          <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" />
              Action Breakdown
            </h3>
            <div className="space-y-6">
              <ActionRow label="Visits (Page Loads)" count={data.actions.visit} total={data.actions.visit} color="bg-blue-500" />
              <ActionRow label="Uploads & Captures" count={data.actions.upload} total={data.actions.visit || 1} color="bg-brand-500" />
              <ActionRow label="Downloads" count={data.actions.download} total={data.actions.visit || 1} color="bg-emerald-500" />
              <ActionRow label="Shares" count={data.actions.share} total={data.actions.visit || 1} color="bg-pink-500" />
            </div>
          </div>

          {/* Top Sources */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Traffic Sources
            </h3>
            
            {data.sources.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No source data available yet.</p>
            ) : (
              <ul className="space-y-4">
                {data.sources.sort((a, b) => b.count - a.count).map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                    <span className="font-medium text-slate-300 truncate pr-4 max-w-[150px] capitalize">
                      {item.source}
                    </span>
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-950 rounded-2xl shadow-inner text-slate-300">
          {icon}
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-slate-400 text-sm font-medium mb-1">{title}</h4>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ActionRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = Math.min(100, Math.round((count / Math.max(1, total)) * 100));
  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-medium">
        <span className="text-slate-300">{label}</span>
        <span className="text-white">{count} ({percentage}%)</span>
      </div>
      <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
