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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-primary">
        <Activity className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600 p-8 text-center">
        <p className="text-xl font-medium mb-4">Error loading dashboard: {error}</p>
        <Link href="/" className="text-primary hover:text-primary/80 underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track user engagement and system usage across your application.</p>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-primary/20 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors self-start md:self-auto"
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
            icon={<Users className="w-6 h-6 text-blue-500" />}
            trend="+12%"
          />
          <StatCard 
            title="Total Uploads" 
            value={data.actions.upload.toString()} 
            icon={<Upload className="w-6 h-6 text-primary" />}
            trend="Stable"
          />
          <StatCard 
            title="Total Downloads" 
            value={data.actions.download.toString()} 
            icon={<Download className="w-6 h-6 text-green-500" />}
            trend="+5%"
          />
          <StatCard 
            title="Total Shares" 
            value={data.actions.share.toString()} 
            icon={<Share2 className="w-6 h-6 text-pink-500" />}
            trend="+2%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Breakdown */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-primary/10 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Action Breakdown
            </h3>
            <div className="space-y-6">
              <ActionRow label="Visits (Page Loads)" count={data.actions.visit} total={data.actions.visit} color="bg-blue-500" />
              <ActionRow label="Uploads & Captures" count={data.actions.upload} total={data.actions.visit || 1} color="bg-primary" />
              <ActionRow label="Downloads" count={data.actions.download} total={data.actions.visit || 1} color="bg-green-500" />
              <ActionRow label="Shares" count={data.actions.share} total={data.actions.visit || 1} color="bg-pink-500" />
            </div>
          </div>

          {/* Top Sources */}
          <div className="bg-white border border-primary/10 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              Traffic Sources
            </h3>
            
            {data.sources.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No source data available yet.</p>
            ) : (
              <ul className="space-y-4">
                {data.sources.sort((a, b) => b.count - a.count).map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-primary/5">
                    <span className="font-medium text-gray-700 truncate pr-4 max-w-[150px] capitalize">
                      {item.source}
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
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
    <div className="bg-white border border-primary/10 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/20 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl shadow-inner text-gray-600">
          {icon}
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ActionRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = Math.min(100, Math.round((count / Math.max(1, total)) * 100));
  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-medium">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900">{count} ({percentage}%)</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-primary/10">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
