"use client";
import { useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "lucide-react";

export default function WebcamCapture({ onCapture }: { onCapture: (file: File, preview: string) => void }) {
  const webcamRef = useRef<Webcam>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onCapture(file, imageSrc);
        });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden rounded-2xl relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "user" }}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-6 w-full flex justify-center">
        <button onClick={capture} className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center border-4 border-slate-900 shadow-xl hover:scale-105 transition-transform">
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}