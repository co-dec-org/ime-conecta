import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAudioLayer, type AudioMode } from "../hooks/useAudioLayer";
import { useVideoLayer, type CapturePurpose } from "../hooks/useVideoLayer";

type Rgb = [number, number, number];

type CanvasPalette = {
  bg: Rgb;
  cyan: Rgb;
  blue: Rgb;
  violet: Rgb;
  green: Rgb;
  amber: Rgb;
};

type AudioVisualState = {
  mode: AudioMode;
  level: number;
  spectrum: number[];
};

const captureScenarios: Record<
  Exclude<CapturePurpose, "frame">,
  { title: string; label: string; description: string; captureCta: string }
> = {
  avatar: {
    title: "Avatar de socio/a",
    label: "Avatar",
    description: "Foto local para ficha, comite o responsable operativo.",
    captureCta: "Capturar avatar",
  },
  receipt: {
    title: "Boleta de rendicion",
    label: "Boleta",
    description: "Respaldo visual para rendicion de gastos o caja chica.",
    captureCta: "Capturar boleta",
  },
};

const fallbackPalette: CanvasPalette = {
  bg: [8, 8, 8],
  cyan: [21, 233, 205],
  blue: [19, 112, 239],
  violet: [103, 85, 209],
  green: [131, 240, 226],
  amber: [255, 248, 175],
};

const readRgbVariable = (
  styles: CSSStyleDeclaration,
  name: string,
  fallback: Rgb,
): Rgb => {
  const parts = styles
    .getPropertyValue(name)
    .split(",")
    .map((part) => Number(part.trim()));

  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    return [parts[0], parts[1], parts[2]];
  }

  return fallback;
};

const readCanvasPalette = (): CanvasPalette => {
  if (typeof window === "undefined") {
    return fallbackPalette;
  }

  const styles = window.getComputedStyle(document.documentElement);

  return {
    bg: fallbackPalette.bg,
    cyan: readRgbVariable(styles, "--cyan-rgb", fallbackPalette.cyan),
    blue: readRgbVariable(styles, "--blue-rgb", fallbackPalette.blue),
    violet: readRgbVariable(styles, "--violet-rgb", fallbackPalette.violet),
    green: readRgbVariable(styles, "--green-rgb", fallbackPalette.green),
    amber: readRgbVariable(styles, "--amber-rgb", fallbackPalette.amber),
  };
};

const rgba = ([red, green, blue]: Rgb, alpha: number) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`;

const resizeCanvasToDisplay = (canvas: HTMLCanvasElement) => {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(bounds.width * ratio));
  const height = Math.max(160, Math.floor(bounds.height * ratio));

  if (canvas.width !== width) {
    canvas.width = width;
  }

  if (canvas.height !== height) {
    canvas.height = height;
  }

  return { width, height };
};

const drawOverlay = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  tick: number,
  visual: AudioVisualState,
  palette: CanvasPalette,
) => {
  const level = visual.mode === "off" ? 0.12 : Math.min(1, visual.level * 2.4);
  const spectrum = visual.spectrum.length ? visual.spectrum : [0];

  context.fillStyle = rgba(palette.bg, 0.2 + level * 0.12);
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.72,
    height * 0.28,
    0,
    width * 0.72,
    height * 0.28,
    width * 0.72,
  );
  glow.addColorStop(0, rgba(palette.blue, 0.18 + level * 0.22));
  glow.addColorStop(0.46, rgba(palette.violet, 0.1 + level * 0.12));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = rgba(palette.cyan, 0.12 + level * 0.1);
  context.lineWidth = 1;

  const gridSize = Math.max(48, 84 - level * 18);
  const gridShift = (tick / 38) % gridSize;

  for (let x = -gridShift; x < width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = -gridShift; y < height; y += gridSize * 0.74) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.fillStyle = rgba(palette.bg, 0.22);
  for (let y = 0; y < height; y += 8) {
    context.fillRect(0, y, width, 2);
  }

  const nodes = [
    [0.18, 0.22],
    [0.38, 0.34],
    [0.68, 0.26],
    [0.78, 0.58],
    [0.48, 0.72],
    [0.22, 0.64],
  ];

  context.strokeStyle = rgba(palette.violet, 0.28 + level * 0.34);
  context.fillStyle = rgba(palette.green, 0.82);
  context.lineWidth = 1.2 + level * 2.2;

  nodes.forEach(([xRatio, yRatio], index) => {
    const band = spectrum[index % spectrum.length] ?? 0;
    const x =
      xRatio * width + Math.sin(tick / 860 + index) * (6 + band * 18);
    const y =
      yRatio * height + Math.cos(tick / 1030 + index) * (5 + band * 14);
    const next = nodes[(index + 1) % nodes.length];
    const nextX = next[0] * width;
    const nextY = next[1] * height;

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(nextX, nextY);
    context.stroke();

    context.beginPath();
    context.arc(x, y, 4 + band * 11 + level * 3, 0, Math.PI * 2);
    context.fill();
  });

  const barCount = Math.min(32, spectrum.length);
  const barWidth = width / (barCount * 1.9);
  const barGap = barWidth * 0.9;
  const startX = width - (barWidth + barGap) * barCount - width * 0.05;
  const baseY = height - height * 0.12;
  context.fillStyle = rgba(palette.cyan, 0.24 + level * 0.46);

  for (let index = 0; index < barCount; index += 1) {
    const band = spectrum[index] ?? 0;
    const barHeight = height * (0.035 + band * 0.24);
    context.fillRect(
      startX + index * (barWidth + barGap),
      baseY - barHeight,
      barWidth,
      barHeight,
    );
  }

  context.setLineDash([12, 18]);
  context.lineDashOffset = -tick / 38;
  context.strokeStyle = rgba(palette.amber, 0.18 + level * 0.22);
  context.lineWidth = 1.4 + level;
  context.strokeRect(width * 0.04, height * 0.05, width * 0.92, height * 0.9);
  context.setLineDash([]);

  context.strokeStyle = rgba(palette.blue, 0.88);
  context.lineWidth = 3;
  context.strokeRect(2, 2, width - 4, height - 4);
};

const drawAudioCanvas = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  tick: number,
  visual: AudioVisualState,
  palette: CanvasPalette,
) => {
  const active = visual.mode !== "off";
  const level = active ? Math.min(1, visual.level * 2.8) : 0.18;
  const spectrum = visual.spectrum.length
    ? visual.spectrum
    : Array.from({ length: 48 }, () => 0);

  const backdrop = context.createLinearGradient(0, 0, width, height);
  backdrop.addColorStop(0, rgba(palette.bg, 0.96));
  backdrop.addColorStop(0.48, rgba(palette.blue, 0.12 + level * 0.12));
  backdrop.addColorStop(1, rgba(palette.violet, 0.16 + level * 0.16));
  context.fillStyle = backdrop;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = rgba(palette.cyan, 0.08 + level * 0.08);
  context.lineWidth = 1;
  for (let x = 0; x < width; x += width / 12) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  const centerX = width * 0.5;
  const centerY = height * 0.46;
  context.globalCompositeOperation = "lighter";

  for (let ring = 0; ring < 4; ring += 1) {
    const radius =
      Math.min(width, height) * (0.16 + ring * 0.085 + level * 0.05);
    context.strokeStyle = rgba(
      ring % 2 === 0 ? palette.cyan : palette.violet,
      0.18 + level * 0.18,
    );
    context.lineWidth = 1.5 + level * 2;
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius + Math.sin(tick / 480 + ring) * (active ? 10 : 3),
      0,
      Math.PI * 2,
    );
    context.stroke();
  }

  const orb = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.min(width, height) * (0.22 + level * 0.16),
  );
  orb.addColorStop(0, rgba(palette.green, 0.62 + level * 0.24));
  orb.addColorStop(0.38, rgba(palette.blue, 0.18 + level * 0.2));
  orb.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = orb;
  context.fillRect(0, 0, width, height);

  const barCount = spectrum.length;
  const step = width / (barCount + 6);
  const barWidth = Math.max(3, step * 0.48);
  const startX = step * 3;
  const floor = height * 0.84;

  for (let index = 0; index < barCount; index += 1) {
    const idle = active ? 0 : 0.08 + Math.sin(tick / 620 + index * 0.4) * 0.035;
    const band = Math.max(spectrum[index] ?? 0, idle);
    const barHeight = height * (0.08 + band * 0.56);
    const hue = index % 3 === 0 ? palette.cyan : index % 3 === 1 ? palette.blue : palette.green;
    context.fillStyle = rgba(hue, 0.22 + band * 0.62);
    context.fillRect(startX + index * step, floor - barHeight, barWidth, barHeight);
  }

  context.strokeStyle = rgba(palette.amber, active ? 0.72 : 0.28);
  context.lineWidth = 2.4;
  context.beginPath();
  spectrum.forEach((band, index) => {
    const x = startX + index * step + barWidth * 0.5;
    const idle = active ? 0 : Math.sin(tick / 420 + index * 0.35) * 0.04;
    const y =
      height * 0.22 +
      Math.sin(index * 0.36 + tick / 530) * height * 0.06 -
      (band + idle) * height * 0.18;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();

  context.globalCompositeOperation = "source-over";
};

export default function VideoLayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [capturePurpose, setCapturePurpose] =
    useState<Exclude<CapturePurpose, "frame">>("avatar");
  const audioVisualRef = useRef<AudioVisualState>({
    mode: "off",
    level: 0,
    spectrum: [],
  });
  const {
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
  } = useVideoLayer();
  const {
    mode: audioMode,
    message: audioMessage,
    support: audioSupport,
    audioLevel,
    spectrum,
    intensity,
    setIntensity,
    startGenerativeAudio,
    startMicrophoneAnalysis,
    stopAudio,
  } = useAudioLayer();

  useEffect(() => {
    audioVisualRef.current = {
      mode: audioMode,
      level: audioLevel,
      spectrum,
    };
  }, [audioLevel, audioMode, spectrum]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = stream;
    if (stream) {
      void video.play();
    }
  }, [stream]);

  useEffect(() => {
    let animationFrame = 0;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !video || !context || !stream) {
      return undefined;
    }

    const drawFrame = (tick: number) => {
      const width = video.videoWidth || 960;
      const height = video.videoHeight || 540;

      if (canvas.width !== width) {
        canvas.width = width;
      }

      if (canvas.height !== height) {
        canvas.height = height;
      }

      context.save();
      context.filter = "contrast(1.16) saturate(0.72) brightness(0.9)";
      context.globalAlpha = 0.74;
      context.drawImage(video, 0, 0, width, height);
      context.restore();

      drawOverlay(
        context,
        width,
        height,
        tick,
        audioVisualRef.current,
        readCanvasPalette(),
      );
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    animationFrame = window.requestAnimationFrame(drawFrame);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [stream]);

  useEffect(() => {
    let animationFrame = 0;
    const canvas = audioCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    const drawFrame = (tick: number) => {
      const { width, height } = resizeCanvasToDisplay(canvas);
      drawAudioCanvas(
        context,
        width,
        height,
        tick,
        audioVisualRef.current,
        readCanvasPalette(),
      );
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    animationFrame = window.requestAnimationFrame(drawFrame);

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const audioLabel =
    audioMode === "generative"
      ? "Sintesis local"
      : audioMode === "microphone"
        ? "Microfono local"
        : "Audio apagado";
  const captureScenario = captureScenarios[capturePurpose];

  const demoContent = (
    <>
      <div className="video-layer-copy">
        <div className="video-layer-toggle">
          <div>
            <p className="eyebrow">Capa Web-Video API</p>
            <h3 id="video-layer-overlay-title">
              Presencia local con trazabilidad visual
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-expanded={isExpanded}
          >
            Contraer demo
          </button>
        </div>

        <p>
          Ejemplo simple para capturar una foto de avatar o una boleta de
          rendicion desde la camara local. El video se procesa en Canvas dentro
          del navegador.
        </p>
        <p className="privacy-note">
          Camara y microfono son opcionales. La grabacion, las capturas y el
          audio se mantienen locales.
        </p>

        <div
          className="capture-scenarios"
          aria-label="Ejemplos de captura operativa"
        >
          {Object.entries(captureScenarios).map(([purpose, scenario]) => (
            <button
              key={purpose}
              type="button"
              aria-pressed={capturePurpose === purpose}
              data-active={capturePurpose === purpose}
              onClick={() =>
                setCapturePurpose(purpose as Exclude<CapturePurpose, "frame">)
              }
            >
              <span>{scenario.label}</span>
              <small>{scenario.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="video-console">
        <div className="presence-card">
          <video
            ref={videoRef}
            className="video-source"
            muted
            playsInline
            aria-hidden="true"
          />
          <canvas ref={canvasRef} aria-label="Preview local procesado en canvas" />
          {!stream ? (
            <div className="video-placeholder">
              <strong>{captureScenario.title}</strong>
              <span>Camara local apagada</span>
            </div>
          ) : null}
        </div>

        <div className="audio-console" aria-label="Controles Web Audio API">
          <div className="audio-stage">
            <canvas ref={audioCanvasRef} aria-label="Visualizador local de audio" />
            <div className="audio-readout">
              <span>{audioLabel}</span>
              <strong>{Math.round(audioLevel * 100)}%</strong>
            </div>
          </div>

          <div className="audio-actions" aria-label="Acciones de audio local">
            <button
              type="button"
              onClick={startGenerativeAudio}
              disabled={!audioSupport.webAudio || audioMode === "generative"}
            >
              Audio generativo
            </button>
            <button
              type="button"
              onClick={startMicrophoneAnalysis}
              disabled={
                !audioSupport.webAudio ||
                !audioSupport.microphone ||
                audioMode === "microphone"
              }
            >
              Analizar microfono
            </button>
            <button type="button" onClick={stopAudio} disabled={audioMode === "off"}>
              Detener audio
            </button>
          </div>

          <label className="intensity-control">
            <span>Intensidad</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(intensity * 100)}
              onChange={(event) => setIntensity(Number(event.target.value) / 100)}
            />
            <strong>{Math.round(intensity * 100)}</strong>
          </label>
        </div>

        <div className="video-actions" aria-label="Controles de video local">
          {!stream ? (
            <button type="button" onClick={startCamera}>
              Activar camara local
            </button>
          ) : (
            <button type="button" onClick={stopCamera}>
              Desactivar camara
            </button>
          )}

          <button
            type="button"
            onClick={() => requestPiP(videoRef.current)}
            disabled={!stream}
          >
            PiP
          </button>

          <button
            type="button"
            onClick={() => captureFrame(canvasRef.current, capturePurpose)}
            disabled={!stream}
          >
            {captureScenario.captureCta}
          </button>

          {!isRecording ? (
            <button
              type="button"
              onClick={() => startRecording(canvasRef.current)}
              disabled={!stream}
            >
              Grabar intervencion local
            </button>
          ) : (
            <button type="button" onClick={stopRecording}>
              Detener grabacion ({recordingSeconds}s)
            </button>
          )}
        </div>

        <div className="support-list" aria-label="Compatibilidad del navegador">
          <span data-supported={support.camera}>Camara</span>
          <span data-supported={support.recorder}>MediaRecorder</span>
          <span data-supported={support.pictureInPicture}>PiP</span>
          <span data-supported={audioSupport.webAudio}>Web Audio</span>
          <span data-supported={audioSupport.microphone}>Microfono</span>
        </div>

        <p className={`video-message ${message.tone}`} role="status">
          {message.text}
        </p>
        <p className={`video-message ${audioMessage.tone}`} role="status">
          {audioMessage.text}
        </p>
      </div>
    </>
  );

  return (
    <>
      <section
        className="video-layer"
        data-expanded="false"
        aria-labelledby="video-layer-title"
      >
        <div className="video-layer-copy">
          <div className="video-layer-toggle">
            <div>
              <p className="eyebrow">Capa Web-Video API</p>
              <h3 id="video-layer-title">
                Presencia local con trazabilidad visual
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              aria-expanded={isExpanded}
            >
              Abrir demo
            </button>
          </div>

          <div className="video-layer-summary">
            <span>Avatar local</span>
            <span>Boleta local</span>
            <span>Canvas + audio</span>
          </div>
        </div>
      </section>

      {isExpanded
        ? createPortal(
            <section
              className="video-layer video-layer-overlay"
              data-expanded="true"
              aria-labelledby="video-layer-overlay-title"
            >
              {demoContent}
            </section>,
            document.body,
          )
        : null}
    </>
  );
}
