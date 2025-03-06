import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const useSoundStore = create((set, get) => ({
  sounds: [
    { id: 'rain', name: 'Yağmur', file: null, volume: 0.5, isPlaying: false, sound: null },
    { id: 'waves', name: 'Dalga', file: null, volume: 0.5, isPlaying: false, sound: null },
    { id: 'wind', name: 'Rüzgar', file: null, volume: 0.5, isPlaying: false, sound: null },
    { id: 'forest', name: 'Orman', file: null, volume: 0.5, isPlaying: false, sound: null },
    { id: 'whitenoise', name: 'Beyaz Gürültü', file: null, volume: 0.5, isPlaying: false, sound: null },
  ],
  
  isBackgroundPlayActive: false,

  initSounds: async () => {
    // Uygulama başladığında ses ayarlarını AsyncStorage'dan yükle
    try {
      const savedSettings = await AsyncStorage.getItem('soundSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        const sounds = get().sounds.map(sound => {
          const savedSound = settings.sounds.find(s => s.id === sound.id);
          if (savedSound) {
            return { ...sound, volume: savedSound.volume, isPlaying: savedSound.isPlaying };
          }
          return sound;
        });
        
        set({ 
          sounds, 
          isBackgroundPlayActive: settings.isBackgroundPlayActive 
        });
        
        // Eğer aktif sesler varsa, onları başlat
        sounds.forEach(sound => {
          if (sound.isPlaying) {
            get().playSound(sound.id);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load sound settings', error);
    }
  },

  saveSettings: async () => {
    // Ses ayarlarını AsyncStorage'a kaydet
    try {
      const { sounds, isBackgroundPlayActive } = get();
      const settingsToSave = {
        sounds: sounds.map(({ id, volume, isPlaying }) => ({ id, volume, isPlaying })),
        isBackgroundPlayActive,
      };
      await AsyncStorage.setItem('soundSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save sound settings', error);
    }
  },

  playSound: async (id) => {
    try {
      const sounds = [...get().sounds];
      const soundIndex = sounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1) return;
      
      let { sound: soundObject } = sounds[soundIndex];
      
      // Ses nesnesi yoksa yeni bir tane oluştur
      if (!soundObject) {
        const { sound } = await Audio.Sound.createAsync(
          sounds[soundIndex].file,
          { 
            isLooping: true, 
            volume: sounds[soundIndex].volume,
            shouldPlay: true,
          }
        );
        soundObject = sound;
        sounds[soundIndex].sound = soundObject;
      } else {
        await soundObject.playAsync();
      }
      
      sounds[soundIndex].isPlaying = true;
      set({ sounds });
      get().saveSettings();
      
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  },

  pauseSound: async (id) => {
    try {
      const sounds = [...get().sounds];
      const soundIndex = sounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1 || !sounds[soundIndex].sound) return;
      
      await sounds[soundIndex].sound.pauseAsync();
      sounds[soundIndex].isPlaying = false;
      set({ sounds });
      get().saveSettings();
      
    } catch (error) {
      console.error('Failed to pause sound', error);
    }
  },

  adjustVolume: async (id, volume) => {
    try {
      const sounds = [...get().sounds];
      const soundIndex = sounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1) return;
      
      sounds[soundIndex].volume = volume;
      
      if (sounds[soundIndex].sound) {
        await sounds[soundIndex].sound.setVolumeAsync(volume);
      }
      
      set({ sounds });
      get().saveSettings();
      
    } catch (error) {
      console.error('Failed to adjust volume', error);
    }
  },

  toggleBackgroundPlay: (active) => {
    set({ isBackgroundPlayActive: active });
    get().saveSettings();
  },

  unloadAllSounds: async () => {
    try {
      const { sounds } = get();
      
      for (const sound of sounds) {
        if (sound.sound) {
          await sound.sound.unloadAsync();
        }
      }
      
      const updatedSounds = sounds.map(sound => ({
        ...sound,
        sound: null,
      }));
      
      set({ sounds: updatedSounds });
      
    } catch (error) {
      console.error('Failed to unload sounds', error);
    }
  },
}));

export default useSoundStore; 