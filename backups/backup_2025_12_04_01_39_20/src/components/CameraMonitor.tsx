import { useEffect, useRef, useState, useCallback } from "react";

interface CameraMonitorProps {
  onViolation: (reason: "camera") => void;
}

const CameraMonitor = ({ onViolation }: CameraMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "active" | "error">("loading");

  const handleViolation = useCallback(() => {
    setStatus("error");
    onViolation("camera");
  }, [onViolation]);

  useEffect(() => {
    let cancelled = false;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          const onLoaded = async () => {
            try {
              await video.play();
              if (!cancelled) {
                setStatus("active");
              }
            } catch (error) {
              handleViolation();
            }
          };
          video.onloadedmetadata = onLoaded;
        }

        const [track] = stream.getVideoTracks();
        if (track) {
          track.onended = handleViolation;
        }
      } catch (error) {
        handleViolation();
      }
    };

    startCamera();

    const visibilityListener = () => {
      if (document.visibilityState !== "visible") {
        handleViolation();
      }
    };

    document.addEventListener("visibilitychange", visibilityListener);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", visibilityListener);
      const stream = streamRef.current;
      stream?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    };
  }, [handleViolation]);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Face Monitoring</h4>
        <span
          className={`text-xs font-medium ${
            status === "active"
              ? "text-green-500"
              : status === "loading"
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          {status === "active"
            ? "Live"
            : status === "loading"
            ? "Starting camera..."
            : "Camera lost"}
        </span>
      </div>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        {status !== "active" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-xs text-white text-center px-3">
              {status === "loading"
                ? "Awaiting camera access"
                : "Camera feed interrupted"}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground hidden lg:block">
        Keep your face within the frame for the entire duration of the exam. Closing the camera or
        leaving the frame will end the session immediately.
      </p>
      <p className="text-xs text-muted-foreground lg:hidden">
        Keep your face visible in the frame.
      </p>
    </div>
  );
};

export default CameraMonitor;
