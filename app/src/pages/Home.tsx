import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { DevicePanel } from '@/components/DevicePanel';
import { ManualControlPanel } from '@/components/ManualControlPanel';
import { WaveformPanel } from '@/components/WaveformPanel';
import { AdvancedModes } from '@/components/AdvancedModes';
import { GameMode } from '@/components/GameMode';
import { AudioPanel } from '@/components/AudioPanel';
import { GuidePanel } from '@/components/GuidePanel';
import { WaveformPlayer } from '@/components/WaveformPlayer';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useButtplug } from '@/hooks/useButtplug';
import { useWaveform } from '@/hooks/useWaveform';
import { useAudioAnalysis } from '@/hooks/useAudioAnalysis';
import type { TabType } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('devices');

  const {
    isConnected,
    isConnecting,
    isScanning,
    error,
    devices,
    connect,
    disconnect,
    startScanning,
    stopScanning,
    stopAllDevices,
    updateDeviceState,
    getDevice,
    setError,
  } = useButtplug();

  const waveform = useWaveform();
  const audio = useAudioAnalysis();

  const renderTab = () => {
    switch (activeTab) {
      case 'devices':
        return (
          <DevicePanel
            isConnected={isConnected}
            isConnecting={isConnecting}
            isScanning={isScanning}
            error={error}
            devices={devices}
            onConnect={connect}
            onDisconnect={disconnect}
            onStartScan={startScanning}
            onStopScan={stopScanning}
            onStopAll={stopAllDevices}
            onClearError={() => setError(null)}
          />
        );
      case 'manual':
        return (
          <ManualControlPanel
            devices={devices}
            isConnected={isConnected}
            onUpdateDeviceState={updateDeviceState}
            getDevice={getDevice}
          />
        );
      case 'patterns':
        return (
          <WaveformPanel
            patterns={waveform.patterns}
            activePattern={waveform.activePattern}
            isPlaying={waveform.isPlaying}
            currentTime={waveform.currentTime}
            isConnected={isConnected}
            hasDevices={devices.size > 0}
            onStartPlayback={waveform.startPlayback}
            onStopPlayback={waveform.stopPlayback}
            onPausePlayback={waveform.pausePlayback}
            onCreatePattern={waveform.createPattern}
            onUpdatePattern={waveform.updatePattern}
            onDeletePattern={waveform.deletePattern}
            onUpdatePoints={waveform.updatePatternPoints}
          />
        );
      case 'modes':
        return (
          <AdvancedModes
            patterns={waveform.patterns}
            isConnected={isConnected}
            hasDevices={devices.size > 0}
            onIntensityChange={(intensity) => {
              // Apply intensity to all devices
              devices.forEach((_, deviceId) => {
                const device = getDevice(deviceId);
                if (device) {
                  updateDeviceState(deviceId, { vibrateIntensity: intensity });
                }
              });
            }}
          />
        );
      case 'games':
        return (
          <GameMode
            isConnected={isConnected}
            hasDevices={devices.size > 0}
            onIntensityChange={(intensity) => {
              // Apply intensity to all devices
              devices.forEach((_, deviceId) => {
                const device = getDevice(deviceId);
                if (device) {
                  updateDeviceState(deviceId, { vibrateIntensity: intensity });
                }
              });
            }}
          />
        );
      case 'audio':
        return (
          <AudioPanel
            file={audio.file}
            waveformData={audio.waveformData}
            duration={audio.duration}
            isPlaying={audio.isPlaying}
            playbackTime={audio.playbackTime}
            intensityScale={audio.intensityScale}
            error={audio.error}
            isLoading={audio.isLoading}
            onLoadFile={audio.loadFile}
            onPlay={audio.play}
            onStop={audio.stop}
            onSetIntensityScale={audio.setIntensityScale}
          />
        );
      case 'guide':
        return <GuidePanel />;
      default:
        return null;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isConnected={isConnected}
      deviceCount={devices.size}
    >
      <WaveformPlayer
        isPlaying={waveform.isPlaying}
        currentTime={waveform.currentTime}
        activePattern={waveform.activePattern}
        devices={devices}
        getIntensityAtTime={waveform.getIntensityAtTime}
        getDevice={getDevice}
      />
      <AudioPlayer
        isPlaying={audio.isPlaying}
        playbackTime={audio.playbackTime}
        duration={audio.duration}
        waveformData={audio.waveformData}
        intensityScale={audio.intensityScale}
        devices={devices}
        getDevice={getDevice}
      />
      {renderTab()}
    </Layout>
  );
}
