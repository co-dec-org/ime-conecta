import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AudioMessage = {
  tone: "info" | "success" | "warning" | "error";
  text: string;
};

export type AudioMode = "off" | "generative" | "microphone";

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const spectrumBins = 48;
const silentSpectrum = () => Array.from({ length: spectrumBins }, () => 0);

const getAudioContextConstructor = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as AudioContextWindow;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function useAudioLayer() {
  const [mode, setMode] = useState<AudioMode>("off");
  const [message, setMessage] = useState<AudioMessage>({
    tone: "info",
    text: "Audio apagado. La sintesis y el microfono requieren una accion explicita.",
  });
  const [audioLevel, setAudioLevel] = useState(0);
  const [spectrum, setSpectrum] = useState<number[]>(silentSpectrum);
  const [intensity, setIntensityState] = useState(0.58);

  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const sourceNodesRef = useRef<Array<OscillatorNode | AudioBufferSourceNode>>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const intensityRef = useRef(intensity);
  const modeRef = useRef<AudioMode>(mode);

  const support = useMemo(
    () => ({
      webAudio: Boolean(getAudioContextConstructor()),
      microphone:
        typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    }),
    [],
  );

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const cancelAnalyserLoop = useCallback(() => {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startAnalyserLoop = useCallback(
    (analyser: AnalyserNode) => {
      cancelAnalyserLoop();

      const raw = new Uint8Array(analyser.frequencyBinCount);
      let lastPaint = 0;

      const read = (tick: number) => {
        if (tick - lastPaint > 32) {
          analyser.getByteFrequencyData(raw);

          const bucketSize = Math.max(1, Math.floor(raw.length / spectrumBins));
          const nextSpectrum: number[] = [];
          let total = 0;

          for (let bucket = 0; bucket < spectrumBins; bucket += 1) {
            let sum = 0;
            const offset = bucket * bucketSize;

            for (let index = 0; index < bucketSize; index += 1) {
              sum += raw[offset + index] ?? 0;
            }

            const value = clamp01(sum / bucketSize / 255);
            nextSpectrum.push(value);
            total += value;
          }

          setSpectrum(nextSpectrum);
          setAudioLevel(clamp01(total / spectrumBins));
          lastPaint = tick;
        }

        animationRef.current = window.requestAnimationFrame(read);
      };

      animationRef.current = window.requestAnimationFrame(read);
    },
    [cancelAnalyserLoop],
  );

  const applyIntensity = useCallback((nextIntensity: number) => {
    const context = contextRef.current;
    if (!context || modeRef.current !== "generative") {
      return;
    }

    const gain = 0.018 + nextIntensity * 0.058;
    const cutoff = 480 + nextIntensity * 1700;
    masterGainRef.current?.gain.setTargetAtTime(gain, context.currentTime, 0.08);
    filterRef.current?.frequency.setTargetAtTime(
      cutoff,
      context.currentTime,
      0.12,
    );
  }, []);

  const disposeGraph = useCallback(
    (options?: { resetUi?: boolean; message?: AudioMessage }) => {
      cancelAnalyserLoop();

      sourceNodesRef.current.forEach((node) => {
        try {
          node.stop();
        } catch {
          // The node may already be stopped by the browser.
        }
        node.disconnect();
      });
      sourceNodesRef.current = [];

      micSourceRef.current?.disconnect();
      micSourceRef.current = null;

      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;

      masterGainRef.current?.disconnect();
      masterGainRef.current = null;
      filterRef.current?.disconnect();
      filterRef.current = null;
      analyserRef.current?.disconnect();
      analyserRef.current = null;

      const context = contextRef.current;
      if (context && context.state !== "closed") {
        void context.close().catch(() => undefined);
      }
      contextRef.current = null;

      modeRef.current = "off";

      if (options?.resetUi !== false) {
        setMode("off");
        setAudioLevel(0);
        setSpectrum(silentSpectrum());
      }

      if (options?.message) {
        setMessage(options.message);
      }
    },
    [cancelAnalyserLoop],
  );

  const setIntensity = useCallback(
    (value: number) => {
      const nextIntensity = clamp01(value);
      intensityRef.current = nextIntensity;
      setIntensityState(nextIntensity);
      applyIntensity(nextIntensity);
    },
    [applyIntensity],
  );

  const startGenerativeAudio = useCallback(async () => {
    const AudioContextConstructor = getAudioContextConstructor();

    if (!support.webAudio || !AudioContextConstructor) {
      setMessage({
        tone: "warning",
        text: "Este navegador no expone Web Audio API.",
      });
      return;
    }

    disposeGraph({ resetUi: true });

    try {
      const context = new AudioContextConstructor();
      contextRef.current = context;

      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.84;
      analyserRef.current = analyser;

      const masterGain = context.createGain();
      masterGain.gain.value = 0.0001;
      masterGainRef.current = masterGain;

      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -28;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.018;
      compressor.release.value = 0.28;

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 480 + intensityRef.current * 1700;
      filter.Q.value = 0.86;
      filterRef.current = filter;

      const delay = context.createDelay(1.2);
      delay.delayTime.value = 0.28;
      const feedback = context.createGain();
      feedback.gain.value = 0.16;
      const wet = context.createGain();
      wet.gain.value = 0.22;

      filter.connect(masterGain);
      filter.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(masterGain);
      masterGain.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(context.destination);

      const frequencies = [55, 82.41, 110, 164.81, 220];
      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = index % 2 === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        oscillator.detune.value = (index - 2) * 3;

        const voiceGain = context.createGain();
        voiceGain.gain.value = 0.014 - index * 0.0014;

        oscillator.connect(voiceGain);

        if ("createStereoPanner" in context) {
          const panner = context.createStereoPanner();
          panner.pan.value = (index - 2) * 0.22;
          voiceGain.connect(panner);
          panner.connect(filter);
        } else {
          voiceGain.connect(filter);
        }

        oscillator.start();
        sourceNodesRef.current.push(oscillator);
      });

      const shimmer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const data = shimmer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * 0.035;
      }

      const noise = context.createBufferSource();
      noise.buffer = shimmer;
      noise.loop = true;
      const noiseGain = context.createGain();
      noiseGain.gain.value = 0.004;
      noise.connect(noiseGain);
      noiseGain.connect(filter);
      noise.start();
      sourceNodesRef.current.push(noise);

      const lfo = context.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.055;
      const lfoGain = context.createGain();
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      sourceNodesRef.current.push(lfo);

      if (context.state === "suspended") {
        await context.resume();
      }

      masterGain.gain.exponentialRampToValueAtTime(
        0.018 + intensityRef.current * 0.058,
        context.currentTime + 0.9,
      );

      setMode("generative");
      setMessage({
        tone: "success",
        text: "Audio generativo local activo. Sintesis, filtro, delay y analizador corren en este navegador.",
      });
      startAnalyserLoop(analyser);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Operacion no soportada.";
      disposeGraph({ resetUi: true });
      setMessage({
        tone: "error",
        text: `No fue posible iniciar Web Audio API: ${reason}`,
      });
    }
  }, [disposeGraph, startAnalyserLoop, support.webAudio]);

  const startMicrophoneAnalysis = useCallback(async () => {
    const AudioContextConstructor = getAudioContextConstructor();

    if (!support.webAudio || !AudioContextConstructor) {
      setMessage({
        tone: "warning",
        text: "Este navegador no expone Web Audio API.",
      });
      return;
    }

    if (!support.microphone) {
      setMessage({
        tone: "warning",
        text: "Este navegador no permite solicitar microfono mediante getUserMedia.",
      });
      return;
    }

    disposeGraph({ resetUi: true });

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      });

      const context = new AudioContextConstructor();
      contextRef.current = context;

      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.72;
      analyserRef.current = analyser;

      const micSource = context.createMediaStreamSource(micStream);
      micSource.connect(analyser);
      micSourceRef.current = micSource;
      micStreamRef.current = micStream;

      if (context.state === "suspended") {
        await context.resume();
      }

      setMode("microphone");
      setMessage({
        tone: "success",
        text: "Analisis de microfono activo. La senal no se reproduce, no se graba y no sale del navegador.",
      });
      startAnalyserLoop(analyser);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Permiso denegado.";
      disposeGraph({ resetUi: true });
      setMessage({
        tone: "error",
        text: `No fue posible analizar el microfono: ${reason}`,
      });
    }
  }, [
    disposeGraph,
    startAnalyserLoop,
    support.microphone,
    support.webAudio,
  ]);

  const stopAudio = useCallback(() => {
    disposeGraph({
      resetUi: true,
      message: {
        tone: "info",
        text: "Audio local detenido. Streams y nodos Web Audio fueron liberados.",
      },
    });
  }, [disposeGraph]);

  useEffect(
    () => () => {
      disposeGraph({ resetUi: false });
    },
    [disposeGraph],
  );

  return {
    mode,
    message,
    support,
    audioLevel,
    spectrum,
    intensity,
    setIntensity,
    startGenerativeAudio,
    startMicrophoneAnalysis,
    stopAudio,
  };
}
