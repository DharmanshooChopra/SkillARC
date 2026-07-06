"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Link2, Hash, QrCode, CheckCircle, AlertCircle, Loader2, Camera, ImagePlus } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface JoinClassModalProps {
  open: boolean;
  onClose: () => void;
}

type JoinTab = "code" | "link" | "qr";

// Simulated class registry for demo: maps code/link to class
const CLASS_REGISTRY: Record<string, string> = {
  "CS101A": "c1",
  "CS201B": "c2",
  "CS301A": "c3",
};

const LINK_REGEX = /classroom\.app\/join\/([A-Z0-9]+)/i;

export function JoinClassModal({ open, onClose }: JoinClassModalProps) {
  const { classes, addClass } = useAppContext();
  const [tab, setTab] = useState<JoinTab>("code");
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [qrScanning, setQrScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qrImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTab("code");
      setCode("");
      setLink("");
      setStatus("idle");
      setErrorMsg("");
      setSuccessMsg("");
      setQrScanning(false);
      setUploadedImage(null);
      setImageProcessing(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && tab === "code") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, tab]);

  const resolveCode = (classCode: string): string | null => {
    const upper = classCode.trim().toUpperCase();
    // Check against registry
    if (CLASS_REGISTRY[upper]) return CLASS_REGISTRY[upper];
    // Also check classes that have a joinCode
    const cls = classes.find(c => c.joinCode === upper || c.joinCode === classCode.trim());
    return cls?.id || null;
  };

  const handleJoin = async (classCode: string) => {
    setStatus("loading");
    setErrorMsg("");
    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));

    const classId = resolveCode(classCode);

    if (!classId) {
      setStatus("error");
      setErrorMsg(`No class found with code "${classCode.trim()}". Please check and try again.`);
      return;
    }

    const found = classes.find(c => c.id === classId);
    if (!found) {
      setStatus("error");
      setErrorMsg("Class not found in the system.");
      return;
    }

    setStatus("success");
    setSuccessMsg(`You've joined "${found.name}" successfully!`);
    setTimeout(() => onClose(), 2000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    handleJoin(code);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = link.match(LINK_REGEX);
    if (match) {
      handleJoin(match[1]);
    } else {
      // Try treating the whole link as a code
      const parts = link.trim().split("/");
      const lastPart = parts[parts.length - 1];
      if (lastPart) handleJoin(lastPart);
      else {
        setStatus("error");
        setErrorMsg("Invalid link format. Please paste a valid Classroom invite link.");
      }
    }
  };

  const handleQrSimulate = () => {
    setQrScanning(true);
    setTimeout(() => {
      setQrScanning(false);
      handleJoin("CS101A");
    }, 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setImageProcessing(true);
      setStatus("idle");
      setErrorMsg("");
      // Simulate QR decode from image
      setTimeout(() => {
        setImageProcessing(false);
        handleJoin("CS101A");
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  const tabs: { id: JoinTab; label: string; icon: React.ElementType }[] = [
    { id: "code", label: "Class Code", icon: Hash },
    { id: "link", label: "Paste Link", icon: Link2 },
    { id: "qr", label: "Scan QR", icon: QrCode },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Join a Class</h2>
              <p className="text-indigo-200 text-sm mt-0.5">Enter a code, paste a link, or scan QR</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setStatus("idle"); setErrorMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === t.id
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {status === "success" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-9 h-9 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Joined!</h3>
              <p className="text-slate-500 text-sm">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Code Tab */}
              {tab === "code" && (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unique Class Code
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={code}
                        onChange={e => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setErrorMsg(""); }}
                        placeholder="e.g. CS101A"
                        maxLength={12}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-gray-900 placeholder-slate-400 tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Try: CS101A, CS201B, or CS301A</p>
                  </div>

                  {status === "error" && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!code.trim() || status === "loading"}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                    ) : "Join Class"}
                  </button>
                </form>
              )}

              {/* Link Tab */}
              {tab === "link" && (
                <form onSubmit={handleLinkSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Invite Link
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <textarea
                        value={link}
                        onChange={e => { setLink(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                        placeholder="https://classroom.app/join/CS101A"
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-gray-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Paste the invite link shared by your faculty.</p>
                  </div>

                  {status === "error" && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!link.trim() || status === "loading"}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                    ) : "Join via Link"}
                  </button>
                </form>
              )}

              {/* QR Tab */}
              {tab === "qr" && (
                <div className="flex flex-col gap-4">
                  {/* Preview area */}
                  <div className="w-full h-44 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                    {uploadedImage && !imageProcessing ? (
                      <img src={uploadedImage} alt="Uploaded QR" className="w-full h-full object-contain rounded-xl" />
                    ) : qrScanning || imageProcessing ? (
                      <>
                        <div className="absolute inset-0 bg-indigo-50/60" />
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_2px_#6366f1]"
                          style={{ animation: "qrScan 1.5s ease-in-out infinite", top: "30%" }}
                        />
                        {uploadedImage
                          ? <img src={uploadedImage} alt="Processing" className="w-full h-full object-contain opacity-50" />
                          : <Camera className="w-12 h-12 text-indigo-400 relative z-10" />
                        }
                        <p className="text-indigo-600 text-sm font-semibold mt-2 relative z-10">
                          {imageProcessing ? "Reading QR code…" : "Scanning…"}
                        </p>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-14 h-14 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400 text-center px-6">Use your camera or upload an image of the QR code</p>
                      </>
                    )}
                  </div>

                  {status === "error" && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Two action buttons side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleQrSimulate}
                      disabled={qrScanning || imageProcessing}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {qrScanning
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</>
                        : <><Camera className="w-4 h-4" /> Open Camera</>
                      }
                    </button>

                    <label className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-indigo-300 text-indigo-700 font-semibold text-sm cursor-pointer transition-colors hover:bg-indigo-50 ${(qrScanning || imageProcessing) ? "opacity-50 pointer-events-none" : ""}`}>
                      {imageProcessing
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading…</>
                        : <><ImagePlus className="w-4 h-4" /> Upload Image</>
                      }
                      <input
                        ref={qrImageRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={qrScanning || imageProcessing}
                      />
                    </label>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    Prototype: both options simulate joining CS101A.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes qrScan {
          0% { top: 10%; }
          50% { top: 80%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}
