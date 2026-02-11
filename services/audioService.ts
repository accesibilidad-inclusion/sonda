
class AudioService {
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private currentType: string | null = null;

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
    }
  }

  // Generate buffer for different noise types
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown'): AudioBuffer {
    if (!this.context) throw new Error("AudioContext not initialized");
    
    const bufferSize = 2 * this.context.sampleRate; // 2 seconds buffer
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) compensate for gain
      }
    }

    return buffer;
  }

  public async playNoise(type: 'white' | 'pink' | 'brown', volume: number = 0.5) {
    this.initContext();
    if (!this.context || !this.gainNode) return;

    // Resume context if suspended (browser policy)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    // Don't restart if already playing same type
    if (this.isPlaying && this.currentType === type) {
      this.setVolume(volume);
      return;
    }

    this.stop();

    try {
      const buffer = this.createNoiseBuffer(type);
      this.source = this.context.createBufferSource();
      this.source.buffer = buffer;
      this.source.loop = true;
      this.source.connect(this.gainNode);
      this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
      this.source.start();
      
      this.isPlaying = true;
      this.currentType = type;
    } catch (e) {
      console.error("Error playing noise:", e);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.context) {
      // Smooth transition
      this.gainNode.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
    }
  }

  public stop() {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {
        // ignore if already stopped
      }
      this.source = null;
    }
    this.isPlaying = false;
    this.currentType = null;
  }
}

export const audioService = new AudioService();
