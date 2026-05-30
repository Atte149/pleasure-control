import { useState, useCallback, useRef, useEffect } from 'react';

const SAMPLE_COUNT = 200;

export function useAudioAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [intensityScale, setIntensityScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const processAudioBuffer = useCallback((buffer: AudioBuffer): number[] => {
    const channelData = buffer.getChannelData(0);
    const samplesPerBin = Math.floor(channelData.length / SAMPLE_COUNT);
    const waveform: number[] = [];

    for (let i = 0; i < SAMPLE_COUNT; i++) {
      let sum = 0;
      const start = i * samplesPerBin;
      const end = Math.min(start + samplesPerBin, channelData.length);
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }
      waveform.push(sum / (end - start));
    }

    // Normalize
    const maxVal = Math.max(...waveform, 0.001);
    return waveform.map(v => v / maxVal);
  }, []);

  const loadFile = useCallback(async (selectedFile: File) => {
    setError(null);
    setIsLoading(true);
    setFile(selectedFile);

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);

      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      const waveform = processAudioBuffer(buffer);
      setWaveformData(waveform);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load audio file';
      setError(message);
      setAudioBuffer(null);
      setWaveformData([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAudioContext, processAudioBuffer]);

  const getIntensityAtTime = useCallback((time: number): number => {
    if (!audioBuffer || waveformData.length === 0) return 0;
    const normalizedTime = Math.max(0, Math.min(time / duration, 0.999));
    const index = Math.floor(normalizedTime * (waveformData.length - 1));
    return waveformData[index] * intensityScale;
  }, [audioBuffer, waveformData, duration, intensityScale]);

  const play = useCallback(() => {
    if (!audioBuffer) return;

    const ctx = getAudioContext();

    // Resume context if suspended (Firefox requirement)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop previous playback
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // ignore
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 1;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    sourceRef.current = source;

    source.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    source.start(0);
    setIsPlaying(true);
    setPlaybackTime(0);
    startTimeRef.current = ctx.currentTime;

    const updatePlayback = () => {
      const elapsed = ctx.currentTime - startTimeRef.current;
      setPlaybackTime(elapsed);
      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(updatePlayback);
      }
    };
    animationRef.current = requestAnimationFrame(updatePlayback);
  }, [audioBuffer, duration, getAudioContext]);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stop();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    file,
    audioBuffer,
    waveformData,
    duration,
    isPlaying,
    playbackTime,
    intensityScale,
    error,
    isLoading,
    loadFile,
    play,
    stop,
    getIntensityAtTime,
    setIntensityScale,
    cleanup,
  };
}
