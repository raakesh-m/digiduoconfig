import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundName =
  | 'cellSelect'     // When selecting a cell
  | 'cellMatch'      // Successful match
  | 'cellMismatch'   // Invalid match attempt
  | 'rowAdd'         // Adding a new row
  | 'levelComplete'  // Level completion
  | 'gameOver'       // Game over
  | 'buttonPress'    // UI button press
  | 'tick'           // Timer tick (last 10 seconds)
  | 'whoosh'         // Transitions/animations
  | 'streak'         // Streak milestone
  | 'powerup'        // Powerup activation
  | 'welcomeMusic'   // Background welcome music
  | 'gameMusic';     // In-game background music

interface SoundConfig {
  volume: number;
  rate?: number;
  loop?: boolean;
}

const SOUND_FILES: Record<SoundName, string> = {
  cellSelect: require('../../assets/wavs/cellclick.wav'),
  cellMatch: require('../../assets/wavs/cell matched.wav'),
  cellMismatch: require('../../assets/wavs/wrongmatch.wav'),
  rowAdd: require('../../assets/wavs/extrarow.wav'),
  levelComplete: require('../../assets/wavs/level complete.wav'),
  gameOver: require('../../assets/wavs/game failed time ended.wav'),
  buttonPress: require('../../assets/wavs/Button press.wav'),
  tick: require('../../assets/wavs/Timer tick sound.wav'),
  whoosh: require('../../assets/wavs/whoosh.wav'),
  streak: require('../../assets/wavs/cell matched.wav'), // Use match sound for streaks
  powerup: require('../../assets/wavs/bonus.wav'),
  welcomeMusic: require('../../assets/wavs/in game music while playing.wav'), // Use game music for now
  gameMusic: require('../../assets/wavs/in game music while playing.wav'),
};

const DEFAULT_CONFIGS: Record<SoundName, SoundConfig> = {
  cellSelect: { volume: 0.3, rate: 1.0 },
  cellMatch: { volume: 0.6, rate: 1.0 },
  cellMismatch: { volume: 0.4, rate: 1.0 },
  rowAdd: { volume: 0.7, rate: 1.0 },
  levelComplete: { volume: 0.8, rate: 1.0 },
  gameOver: { volume: 0.6, rate: 1.0 },
  buttonPress: { volume: 0.4, rate: 1.0 },
  tick: { volume: 0.5, rate: 1.0 },
  whoosh: { volume: 0.5, rate: 1.0 },
  streak: { volume: 0.7, rate: 1.0 },
  powerup: { volume: 0.8, rate: 1.0 },
  welcomeMusic: { volume: 0.3, rate: 1.0, loop: true },
  gameMusic: { volume: 0.2, rate: 1.0, loop: true },
};

export const useSound = () => {
  const soundObjects = useRef<Map<SoundName, Audio.Sound>>(new Map());
  const isMuted = useRef(false);
  const masterVolume = useRef(0.7);
  const webAudioEnabled = useRef(false);
  const mobileAudioEnabled = useRef(false);
  const currentMusic = useRef<SoundName | null>(null);
  const musicLoop = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Preload all sounds
        for (const [soundName, soundFile] of Object.entries(SOUND_FILES)) {
          try {
            const { sound } = await Audio.Sound.createAsync(soundFile, {
              shouldPlay: false,
              volume: DEFAULT_CONFIGS[soundName as SoundName].volume * masterVolume.current,
              rate: DEFAULT_CONFIGS[soundName as SoundName].rate || 1.0,
              isLooping: DEFAULT_CONFIGS[soundName as SoundName].loop || false,
            });
            soundObjects.current.set(soundName as SoundName, sound);
          } catch (error) {
            console.warn(`❌ Failed to load sound: ${soundName}`, error);
          }
        }
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup all sounds
      soundObjects.current.forEach(sound => {
        sound.unloadAsync().catch(console.warn);
      });
      soundObjects.current.clear();
    };
  }, []);

  // Rich Web Audio sound effects
  const playWebSoundEffect = useCallback((soundName: SoundName, ctx: AudioContext, config: Partial<SoundConfig> = {}) => {
    const now = ctx.currentTime;
    const volume = (config.volume ?? DEFAULT_CONFIGS[soundName].volume) * masterVolume.current;

    switch (soundName) {
      case 'cellSelect':
        // Soft click with reverb
        const selectOsc = ctx.createOscillator();
        const selectGain = ctx.createGain();
        const selectFilter = ctx.createBiquadFilter();

        selectOsc.connect(selectFilter);
        selectFilter.connect(selectGain);
        selectGain.connect(ctx.destination);

        selectOsc.type = 'sine';
        selectOsc.frequency.setValueAtTime(800, now);
        selectOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        selectFilter.type = 'lowpass';
        selectFilter.frequency.setValueAtTime(2000, now);

        selectGain.gain.setValueAtTime(0, now);
        selectGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
        selectGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        selectOsc.start(now);
        selectOsc.stop(now + 0.15);
        break;

      case 'cellMatch':
        // Satisfying chord progression
        const matchFreqs = [523, 659, 784]; // C, E, G chord
        const streakMultiplier = (config.rate ?? 1.0);

        matchFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * streakMultiplier, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, now);
          filter.Q.setValueAtTime(2, now);

          gain.gain.setValueAtTime(0, now + i * 0.05);
          gain.gain.linearRampToValueAtTime(volume * 0.2, now + i * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.start(now + i * 0.05);
          osc.stop(now + 0.4);
        });
        break;

      case 'cellMismatch':
        // Discord buzz with distortion
        const mismatchOsc = ctx.createOscillator();
        const mismatchGain = ctx.createGain();
        const distortion = ctx.createWaveShaper();

        // Create distortion curve
        const samples = 44100;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.5);
        }
        distortion.curve = curve;

        mismatchOsc.connect(distortion);
        distortion.connect(mismatchGain);
        mismatchGain.connect(ctx.destination);

        mismatchOsc.type = 'sawtooth';
        mismatchOsc.frequency.setValueAtTime(220, now);
        mismatchOsc.frequency.linearRampToValueAtTime(180, now + 0.3);

        mismatchGain.gain.setValueAtTime(0, now);
        mismatchGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.02);
        mismatchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        mismatchOsc.start(now);
        mismatchOsc.stop(now + 0.3);
        break;

      case 'levelComplete':
        // Victory fanfare with multiple harmonics
        const fanfareNotes = [523, 659, 784, 1047]; // C, E, G, C octave
        fanfareNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const reverb = ctx.createConvolver();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);

          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(volume * 0.6, now + i * 0.1 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.8);

          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.8);
        });
        break;

      case 'streak':
        // Rising cascade effect
        const streakCount = config.rate ?? 1;
        for (let i = 0; i < Math.min(streakCount, 8); i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + i * 110, now + i * 0.08);

          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.3);
        }
        break;

      case 'powerup':
        // Energetic power-up sweep
        const powerOsc = ctx.createOscillator();
        const powerGain = ctx.createGain();
        const powerFilter = ctx.createBiquadFilter();

        powerOsc.connect(powerFilter);
        powerFilter.connect(powerGain);
        powerGain.connect(ctx.destination);

        powerOsc.type = 'sawtooth';
        powerOsc.frequency.setValueAtTime(200, now);
        powerOsc.frequency.exponentialRampToValueAtTime(800, now + 0.5);

        powerFilter.type = 'bandpass';
        powerFilter.frequency.setValueAtTime(400, now);
        powerFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.5);
        powerFilter.Q.setValueAtTime(10, now);

        powerGain.gain.setValueAtTime(0, now);
        powerGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.1);
        powerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        powerOsc.start(now);
        powerOsc.stop(now + 0.5);
        break;

      default:
        // Simple beep for other sounds
        const defaultOsc = ctx.createOscillator();
        const defaultGain = ctx.createGain();

        defaultOsc.connect(defaultGain);
        defaultGain.connect(ctx.destination);

        const frequencies: Record<string, number> = {
          gameOver: 150,
          buttonPress: 600,
          rowAdd: 900,
          tick: 1500,
          whoosh: 400,
        };

        defaultOsc.type = soundName === 'gameOver' ? 'sawtooth' : 'sine';
        defaultOsc.frequency.setValueAtTime(frequencies[soundName] || 800, now);

        defaultGain.gain.setValueAtTime(0, now);
        defaultGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
        defaultGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        defaultOsc.start(now);
        defaultOsc.stop(now + 0.2);
    }
  }, []);

  const playWebMusic = useCallback((musicType: 'welcomeMusic' | 'gameMusic', ctx: AudioContext) => {
    if (musicLoop.current) {
      clearInterval(musicLoop.current);
    }

    const playMelody = () => {
      if (musicType === 'welcomeMusic') {
        // Gentle welcome melody
        const welcomeNotes = [
          {freq: 523, duration: 0.8}, // C
          {freq: 659, duration: 0.4}, // E
          {freq: 784, duration: 0.8}, // G
          {freq: 659, duration: 0.4}, // E
          {freq: 523, duration: 1.2}, // C
        ];

        welcomeNotes.forEach((note, i) => {
          setTimeout(() => {
            if (isMuted.current) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(masterVolume.current * 0.1, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + note.duration);
          }, i * 800);
        });
      } else {
        // Energetic game music
        const gameNotes = [
          {freq: 440, duration: 0.3}, // A
          {freq: 523, duration: 0.3}, // C
          {freq: 659, duration: 0.3}, // E
          {freq: 784, duration: 0.6}, // G
        ];

        gameNotes.forEach((note, i) => {
          setTimeout(() => {
            if (isMuted.current) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(masterVolume.current * 0.08, ctx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + note.duration);
          }, i * 300);
        });
      }
    };

    // Play once without looping
    playMelody();
  }, []);

  const stopMusic = useCallback(() => {
    // Stop web audio music loop
    if (musicLoop.current) {
      clearInterval(musicLoop.current);
      musicLoop.current = null;
    }

    // Stop mobile music (expo-av) but keep track of what was playing
    if (Platform.OS !== 'web' && currentMusic.current) {
      const musicSound = soundObjects.current.get(currentMusic.current);
      if (musicSound) {
        musicSound.stopAsync().catch(console.warn);
      }
      // Don't clear currentMusic.current - we want to remember what was playing
    }
  }, []);

  // Enable web audio on first user interaction
  const enableWebAudio = useCallback(() => {
    if (Platform.OS === 'web' && !webAudioEnabled.current) {
      webAudioEnabled.current = true;
    }
  }, []);


  const playSound = useCallback(async (
    soundName: SoundName,
    config: Partial<SoundConfig> = {}
  ) => {
    if (isMuted.current) {
      return;
    }

    // On web, require user interaction first
    if (Platform.OS === 'web' && !webAudioEnabled.current) {
      enableWebAudio();
    }

    // Enhanced Web Audio API with rich sound effects
    if (Platform.OS === 'web') {
      try {
        if (!audioContext.current) {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContext.current;

        if (soundName === 'welcomeMusic' || soundName === 'gameMusic') {
          playWebMusic(soundName, ctx);
          return;
        }

        playWebSoundEffect(soundName, ctx, config);
        return;
      } catch (error) {
        console.warn('Web Audio API fallback failed:', error);
      }
    }

    const sound = soundObjects.current.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}, using mobile fallback`);
      // Mobile fallback - generate simple beep tones using expo-av
      if (Platform.OS !== 'web') {
        try {
          // Create a simple tone using expo-av's audio system
          // This is a fallback for when MP3 files fail to load
          console.warn('Using silent fallback for mobile - sound system will be silent');
          return;
        } catch (error) {
          console.warn('Mobile audio fallback failed:', error);
          return;
        }
      } else {
        // Web fallback using Web Audio API
        try {
          if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioContext.current;

          if (soundName === 'welcomeMusic' || soundName === 'gameMusic') {
            playWebMusic(soundName, ctx);
            return;
          }

          playWebSoundEffect(soundName, ctx, config);
          return;
        } catch (error) {
          console.warn('Web Audio API fallback failed:', error);
          return;
        }
      }
    }

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        // Stop if already playing
        await sound.stopAsync();
        await sound.setPositionAsync(0);

        // Apply configuration
        const finalVolume = (config.volume ?? DEFAULT_CONFIGS[soundName].volume) * masterVolume.current;
        await sound.setVolumeAsync(finalVolume);

        if (config.rate) {
          await sound.setRateAsync(config.rate, true);
        }

        // Handle looping for background music
        const shouldLoop = config.loop ?? DEFAULT_CONFIGS[soundName].loop ?? false;
        await sound.setIsLoopingAsync(shouldLoop);


        // Track current music for mute/unmute functionality
        if (soundName === 'welcomeMusic' || soundName === 'gameMusic') {
          currentMusic.current = soundName;
        }

        await sound.playAsync();
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}, trying fallback`, error);
      // Platform-specific fallback when expo-av fails
      if (Platform.OS !== 'web') {
        // Mobile fallback - just log the issue for now
        console.warn('Mobile audio playback failed - sound will be silent');
      } else {
        // Web fallback using Web Audio API
        try {
          if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioContext.current;

          if (soundName === 'welcomeMusic' || soundName === 'gameMusic') {
            playWebMusic(soundName, ctx);
            return;
          }

          playWebSoundEffect(soundName, ctx, config);
        } catch (fallbackError) {
          console.warn('Web Audio API fallback also failed:', fallbackError);
        }
      }
    }
  }, []);

  // Enable mobile audio and start welcome music on first user interaction
  const enableMobileAudio = useCallback(() => {
    if (Platform.OS !== 'web' && !mobileAudioEnabled.current) {
      mobileAudioEnabled.current = true;
      // Start welcome music now that user has interacted
      playSound('welcomeMusic');
    }
  }, [playSound]);

  const setMasterVolume = useCallback(async (volume: number) => {
    masterVolume.current = Math.max(0, Math.min(1, volume));

    // Update all loaded sounds
    soundObjects.current.forEach(async (sound) => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setVolumeAsync(volume);
        }
      } catch (error) {
        console.warn('Failed to update sound volume:', error);
      }
    });
  }, []);

  const toggleMute = useCallback(() => {
    isMuted.current = !isMuted.current;

    // Handle background music muting/unmuting
    if (isMuted.current) {
      // Muted: stop all background music (but remember what was playing)
      stopMusic();
    } else {
      // Unmuted: restart the last playing music if mobile audio is enabled
      if (Platform.OS !== 'web' && mobileAudioEnabled.current && currentMusic.current) {
        playSound(currentMusic.current);
      }
    }

    return isMuted.current;
  }, [playSound, stopMusic]);

  const getMuted = useCallback(() => isMuted.current, []);

  const getMasterVolume = useCallback(() => masterVolume.current, []);

  // Convenience functions for common game sounds
  const playCellSelect = useCallback(() => playSound('cellSelect'), [playSound]);
  const playCellMatch = useCallback((streakCount = 1) => {
    playSound('cellMatch', { rate: Math.min(1.2, 1.0 + (streakCount - 1) * 0.1) });
  }, [playSound]);
  const playCellMismatch = useCallback(() => playSound('cellMismatch'), [playSound]);
  const playRowAdd = useCallback(() => playSound('rowAdd'), [playSound]);
  const playLevelComplete = useCallback(() => playSound('levelComplete'), [playSound]);
  const playGameOver = useCallback(() => playSound('gameOver'), [playSound]);
  const playButtonPress = useCallback(() => playSound('buttonPress'), [playSound]);
  const playTick = useCallback(() => playSound('tick'), [playSound]);
  const playWhoosh = useCallback(() => playSound('whoosh'), [playSound]);
  const playStreak = useCallback((streakCount: number) => {
    playSound('streak', { rate: Math.min(1.5, 1.0 + streakCount * 0.1) });
  }, [playSound]);
  const playPowerup = useCallback(() => playSound('powerup'), [playSound]);
  const playWelcomeMusic = useCallback(() => playSound('welcomeMusic'), [playSound]);
  const playGameMusic = useCallback(() => playSound('gameMusic'), [playSound]);

  return {
    playSound,
    setMasterVolume,
    toggleMute,
    getMuted,
    getMasterVolume,
    enableWebAudio,
    enableMobileAudio,
    stopMusic,
    // Convenience functions
    playCellSelect,
    playCellMatch,
    playCellMismatch,
    playRowAdd,
    playLevelComplete,
    playGameOver,
    playButtonPress,
    playTick,
    playWhoosh,
    playStreak,
    playPowerup,
    playWelcomeMusic,
    playGameMusic,
  };
};