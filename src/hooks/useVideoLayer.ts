import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type VideoMessage = {
  tone: "info" | "success" | "warning" | "error";
  text: string;
};

export type CapturePurpose = "avatar" | "receipt" | "frame";

const capturePurposeCopy: Record<
  CapturePurpose,
  { filename: string; label: string }
> = {
  avatar: {
    filename: "avatar-socio",
    label: "avatar de socio/a",
  },
  receipt: {
    filename: "boleta-rendicion",
    label: "boleta para rendicion de gastos",
  },
  frame: {
    filename: "capa-video",
    label: "frame operativo",
  },
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
};

const timestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

export function useVideoLayer() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [message, setMessage] = useState<VideoMessage>({
    tone: "info",
    text: "La camara esta apagada. La activacion requiere permiso explicito.",
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const support = useMemo(
    () => ({
      camera:
        typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
      recorder: typeof window !== "undefined" && "MediaRecorder" in window,
      pictureInPicture:
        typeof document !== "undefined" &&
        Boolean(document.pictureInPictureEnabled) &&
        typeof HTMLVideoElement !== "undefined" &&
        "requestPictureInPicture" in HTMLVideoElement.prototype,
    }),
    [],
  );

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const clearRecordingTimers = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    clearRecordingTimers();

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  }, [clearRecordingTimers]);

  const stopCamera = useCallback(() => {
    stopRecording();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setMessage({
      tone: "info",
      text: "Camara local desactivada. No se conserva ningun stream.",
    });
  }, [stopRecording]);

  const startCamera = useCallback(async () => {
    if (!support.camera) {
      setMessage({
        tone: "warning",
        text: "Este navegador no expone acceso a camara mediante getUserMedia.",
      });
      return;
    }

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      setStream(nextStream);
      setMessage({
        tone: "success",
        text: "Camara local activa. El video se procesa en este navegador.",
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Permiso denegado.";
      setMessage({
        tone: "error",
        text: `No fue posible activar la camara: ${reason}`,
      });
    }
  }, [support.camera]);

  const captureFrame = useCallback(
    (
      canvas: HTMLCanvasElement | null,
      purpose: CapturePurpose = "frame",
    ) => {
      if (!canvas) {
        setMessage({
          tone: "warning",
          text: "El canvas aun no esta listo para capturar un frame.",
        });
        return;
      }

      const copy = capturePurposeCopy[purpose];

      canvas.toBlob((blob) => {
        if (!blob) {
          setMessage({
            tone: "error",
            text: "No fue posible generar la captura PNG local.",
          });
          return;
        }

        downloadBlob(blob, `ime-conecta-${copy.filename}-${timestamp()}.png`);
        setMessage({
          tone: "success",
          text: `Captura local de ${copy.label} descargada como PNG. No se envio a ningun servidor.`,
        });
      }, "image/png");
    },
    [],
  );

  const requestPiP = useCallback(
    async (video: HTMLVideoElement | null) => {
      if (!support.pictureInPicture) {
        setMessage({
          tone: "warning",
          text: "Picture-in-Picture no esta disponible en este navegador.",
        });
        return;
      }

      if (!video || !streamRef.current) {
        setMessage({
          tone: "warning",
          text: "Activa la camara antes de abrir Picture-in-Picture.",
        });
        return;
      }

      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          return;
        }

        await video.requestPictureInPicture();
        setMessage({
          tone: "success",
          text: "Vista Picture-in-Picture activa.",
        });
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "Operacion no soportada.";
        setMessage({
          tone: "error",
          text: `No fue posible activar PiP: ${reason}`,
        });
      }
    },
    [support.pictureInPicture],
  );

  const startRecording = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!support.recorder) {
        setMessage({
          tone: "warning",
          text: "MediaRecorder no esta disponible en este navegador.",
        });
        return;
      }

      if (!canvas || !streamRef.current) {
        setMessage({
          tone: "warning",
          text: "Activa la camara antes de grabar una intervencion local.",
        });
        return;
      }

      if (isRecording) {
        return;
      }

      const outputStream = canvas.captureStream(24);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      chunksRef.current = [];
      const recorder = new MediaRecorder(outputStream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        if (blob.size > 0) {
          downloadBlob(blob, `ime-conecta-intervencion-local-${timestamp()}.webm`);
        }

        outputStream.getTracks().forEach((track) => track.stop());
        chunksRef.current = [];
        recorderRef.current = null;
        setIsRecording(false);
        setRecordingSeconds(0);
        setMessage({
          tone: "success",
          text: "Grabacion local descargada como WebM. No se subio al servidor.",
        });
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setMessage({
        tone: "info",
        text: "Grabacion local en curso. Duracion maxima: 60 segundos.",
      });

      intervalRef.current = window.setInterval(() => {
        setRecordingSeconds((seconds) => Math.min(seconds + 1, 60));
      }, 1000);

      timeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, 60000);
    },
    [isRecording, stopRecording, support.recorder],
  );

  useEffect(
    () => () => {
      clearRecordingTimers();
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [clearRecordingTimers],
  );

  return {
    stream,
    message,
    support,
    isRecording,
    recordingSeconds,
    startCamera,
    stopCamera,
    captureFrame,
    requestPiP,
    startRecording,
    stopRecording,
  };
}
