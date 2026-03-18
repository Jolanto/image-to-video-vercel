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
  X,
  Pause,
  PlayCircle,
  CloudUpload
} from "lucide-react";
import dynamic from "next/dynamic";

const WebcamCapture = dynamic(() => import("@/app/WebcamCapture"), {
  ssr: false,
  loading: () => <p className="text-slate-400 text-sm">Loading camera...</p>,
});

type ViewState = "input" | "processing" | "result";
type InputMethod = "upload" | "camera";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [inputMethod, setInputMethod] = useState<InputMethod>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { trackAction } = useTracking();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      trackAction("upload");
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }
      setVideoUrl(data.videoUrl);
      setViewState("result");
      setIsPlaying(true); // Start playing by default
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setViewState("input");
    }
  };

  const handleDownload = () => {
    trackAction("download");
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = "pinkvilla-ai-video.mp4";
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
          title: "Pinkvilla Generated Video",
          text: "Check out my image transformed into a video using Pinkvilla!",
          url: videoUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(videoUrl || "");
      alert("Link copied to clipboard!");
    }
  };

  const resetAll = () => {
    setViewState("input");
    clearSelection();
    setVideoUrl(null);
    setProgress(0);
    setVideoProgress(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    const video = document.querySelector('video');
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="font-black text-2xl text-primary">Pinkvilla</div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-12 md:py-20 overflow-hidden">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-black md:text-6xl">
              Transform Your Images into <br />
              <span className="text-primary">Viral Videos</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Create stunning AI-powered animations from your photos in seconds. Professional cinematic results with one click.
            </p>
          </div>
          <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 dark:opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent blur-3xl rounded-full"></div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto mb-20 max-w-5xl px-6">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column - Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Upload Area */}
              <div className={`rounded-2xl border-2 border-dashed border-primary/20 bg-white p-8 shadow-sm backdrop-blur-sm ${viewState === 'result' ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-lg font-bold mb-4">Step 1: Upload Source</h3>
                
                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-300">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      onClick={clearSelection}
                      className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white border border-gray-300 rounded-full text-gray-700 backdrop-blur transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Method Selection */}
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setInputMethod("upload")}
                        className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
                          inputMethod === "upload"
                            ? "bg-white text-primary shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <button
                        onClick={() => setInputMethod("camera")}
                        className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
                          inputMethod === "camera"
                            ? "bg-white text-primary shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        Camera
                      </button>
                    </div>

                    {/* Upload/Camera Interface */}
                    {inputMethod === "upload" ? (
                      <div className="flex flex-col items-center justify-center gap-4 text-center py-10 border-2 border-dashed border-primary/10 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group">
                        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CloudUpload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">Select an image</p>
                          <p className="text-xs text-gray-500">JPG, PNG or WebP (Max 5MB)</p>
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-md"
                        >
                          Browse Files
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-10 border-2 border-dashed border-primary/10 rounded-xl">
                        {typeof window !== 'undefined' ? (
                          <div className="w-full space-y-4">
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                              <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "user" }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-4 w-full flex justify-center">
                                <button
                                  onClick={captureCamera}
                                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-xl hover:scale-105 transition-transform"
                                >
                                  <Camera className="w-6 h-6 text-white" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Click to capture photo</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8">
                            <Camera className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-400 text-sm">Camera not available in production</p>
                            <p className="text-gray-500 text-xs mt-2">Please upload an image file instead</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Generate Button */}
                {file && (
                  <button
                    onClick={handleGenerate}
                    className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-bold text-white shadow-lg hover:bg-primary/90 transition-all"
                  >
                    Generate Video
                  </button>
                )}
              </div>

              {/* Progress Display */}
              {viewState === "processing" && (
                <div className="rounded-2xl bg-white p-6 shadow-xl shadow-primary/5 border border-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Active Task</h3>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">ID: #PV-88291</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">AI is crafting your video...</span>
                      <span className="font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/10">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 italic">Processing frames and applying high-fidelity cinematic effects...</p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Right Column - Video Preview */}
            <div className="lg:col-span-7">
              {viewState === "result" && videoUrl ? (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-primary/20 aspect-video relative group">
                    <div 
                      onClick={togglePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-16 h-16 text-white" />
                      ) : (
                        <PlayCircle className="w-16 h-16 text-white" />
                      )}
                    </div>
                    <video 
                      src={videoUrl} 
                      autoPlay 
                      loop 
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onTimeUpdate={(e) => {
                        const video = e.currentTarget;
                        if (video.duration) {
                          setVideoProgress((video.currentTime / video.duration) * 100);
                        }
                      }}
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                      <div className="flex items-center gap-2">
                        {videoUrl && (
                          <div className="h-1 w-full rounded-full bg-white/30">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-300" 
                              style={{ width: `${videoProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      {videoUrl && (
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Preview</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      {videoUrl && (
                        <button 
                          onClick={handleDownload}
                          className="flex items-center gap-2 rounded-lg bg-white border border-primary/20 px-4 py-3 text-sm font-bold hover:bg-primary/5"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                      {videoUrl && (
                        <button 
                          onClick={handleShare}
                          className="flex items-center gap-2 rounded-lg bg-white border border-primary/20 px-4 py-3 text-sm font-bold hover:bg-primary/5"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      )}
                      <button 
                        onClick={resetAll}
                        className="flex items-center gap-2 rounded-lg bg-white border border-primary/20 px-4 py-3 text-sm font-bold hover:bg-primary/5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Start Over
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-white p-4 border border-primary/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Duration</p>
                      <p className="font-bold">0:15s</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-primary/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Resolution</p>
                      <p className="font-bold">1080x1920</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-primary/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Style</p>
                      <p className="font-bold">Cinematic</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-primary/20 aspect-video relative group">

                  <img 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Video preview placeholder" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuFy1TBBPgaL-x5TPLH3M-Gxv2XEPUeYva6U4ZoYkrwAJeGhASnfLqVr_Gl3mMt4Vocqmjdk_FedE0SvZ9i9i5v25mYe6IttdZyTAf7ANc657TBhyeruezn8gGWWJDXFbLMbUuzDcOfwDpKbMX0ZA8rWB0uKwZu8lwzWxY2tA-7Stl_affDXmjK1Qy2TWMpDIBBP3b3ik90MA_lFisarU1qYLGIVVHBVo-ERtzx8nBYMbqEU8IV5m22vqHPbavYJOxFG38nZHFRQ"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="font-black text-2xl text-primary">Pinkvilla</div>
              </div>
              <div className="flex gap-4">
                <a className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="text-sm">IG</span>
                </a>
                <a className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="text-sm">YT</span>
                </a>
                <a className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="text-sm">FB</span>
                </a>
                <a className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="text-sm">X</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Explore</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-primary" href="#">Latest News</a></li>
                <li><a className="hover:text-primary" href="#">Cinema</a></li>
                <li><a className="hover:text-primary" href="#">Bollywood</a></li>
                <li><a className="hover:text-primary" href="#">Fashion</a></li>
                <li><a className="hover:text-primary" href="#">Beauty</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-primary" href="#">About Us</a></li>
                <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary" href="#">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Analytics</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-primary" href="/dashboard">View Dashboard</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p> 2024 Pinkvilla Media Private Limited. All rights reserved.</p>
            <div className="flex gap-6"></div>
          </div>
        </div>
      </footer>
    </>
  );
}