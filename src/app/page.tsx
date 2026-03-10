"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useTracking } from "@/hooks/useTracking";
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Video, 
  Download, 
  Share2, 
  RefreshCw, 
  Wand2,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

type ViewState = "input" | "processing" | "result";
type InputMethod = "upload" | "camera";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [inputMethod, setInputMethod] = useState<InputMethod>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const { trackAction } = useTracking();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial visit
  useEffect(() => {
    trackAction("visit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds the 5MB limit.");
        return;
      }
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const captureCamera = useCallback(() => {
    setError(null);
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to file
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const capturedFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setFile(capturedFile);
          setPreviewUrl(imageSrc);
        })
        .catch(() => setError("Failed to process camera image."));
    }
  }, [webcamRef]);

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setError(null);
    setViewState("processing");
    try {
      trackAction("upload");
      
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setVideoUrl(data.videoUrl);
      setViewState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setViewState("input");
    }
  };

  const handleDownload = () => {
    trackAction("download");
    // Simple download logic
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = "vividly-generated-video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    trackAction("share");
    if (navigator.share && videoUrl) {
      try {
        await navigator.share({
          title: "Vividly Generated Video",
          text: "Check out my image transformed into a video using Vividly!",
          url: videoUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(videoUrl || "");
      alert("Link copied to clipboard!");
    }
  };

  const resetAll = () => {
    setViewState("input");
    clearSelection();
    setVideoUrl(null);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 min-h-screen max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="w-full text-center max-w-2xl mx-auto mb-10 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Bring your images to Life
        </h1>
        <p className="text-slate-400 text-lg">
          Upload any image and our AI will generate a captivating video in seconds. Free to use, no signup required.
        </p>
      </div>

      {error && (
        <div className="mb-6 w-full max-w-xl flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 shadow-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
        
        {viewState === "input" && (
          <div className="flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Input Selection Tabs */}
            <div className="flex p-1 bg-slate-950/50 rounded-2xl">
              <button
                onClick={() => setInputMethod("upload")}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ${
                  inputMethod === "upload" 
                    ? "bg-slate-800 text-white shadow-md border border-slate-700" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setInputMethod("camera")}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ${
                  inputMethod === "camera" 
                    ? "bg-slate-800 text-white shadow-md border border-slate-700" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Camera className="w-4 h-4" />
                Capture Camera
              </button>
            </div>

            {/* Input Area */}
            <div className="flex flex-col items-center justify-center relative">
              {previewUrl ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <button 
                    onClick={clearSelection}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black border border-white/10 rounded-full text-white backdrop-blur transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-[300px] border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-2xl bg-slate-950/30 flex flex-col items-center justify-center transition-colors group relative">
                  {inputMethod === "upload" ? (
                    <>
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-brand-400" />
                      </div>
                      <p className="text-slate-300 font-medium text-lg">Click to browse or drag and drop</p>
                      <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG (Max 5MB)</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[300px] border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-2xl bg-slate-950/30 flex flex-col items-center justify-center transition-colors group relative">
                      {typeof window !== 'undefined' ? (
                        <div className="w-full h-full flex flex-col items-center overflow-hidden rounded-2xl">
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-6 w-full flex justify-center">
                            <button 
                              onClick={captureCamera}
                              className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center border-4 border-slate-900 shadow-xl hover:scale-105 transition-transform"
                            >
                              <Camera className="w-6 h-6 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                          <Camera className="w-16 h-16 text-slate-400 mb-4" />
                          <p className="text-slate-400 text-sm">Camera not available in production</p>
                          <p className="text-slate-500 text-xs mt-2">Please upload an image file instead</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                onClick={handleGenerate}
                disabled={!file}
                className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-brand-600 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
              >
                <Wand2 className="w-5 h-5" />
                Generate Video
              </button>
            </div>
          </div>
        )}

        {viewState === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-300">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-brand-400 animate-spin flex items-center justify-center animation-delay-150">
                <Wand2 className="w-8 h-8 text-brand-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Creating Magic</h3>
            <p className="text-slate-400 max-w-sm">
              Our AI is analyzing your image and generating stunning visual effects. This usually takes a few seconds.
            </p>
          </div>
        )}

        {viewState === "result" && videoUrl && (
          <div className="flex flex-col space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-medium text-white">Video Generated</h3>
              </div>
              <button 
                onClick={resetAll}
                className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Start Over
              </button>
            </div>
            
            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl relative aspect-video">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
              >
                <Download className="w-5 h-5" />
                Download MP4
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                <Share2 className="w-5 h-5" />
                Share Video
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-slate-500 text-sm">
        <p>Built for demonstrating the Image to Video API flow.</p>
        <p className="mt-1 hover:text-brand-400 transition-colors">
          <a href="/dashboard">View Analytics Dashboard &rarr;</a>
        </p>
      </div>
    </main>
  );
}
