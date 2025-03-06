import { useEffect } from 'react';
import { Audio } from 'expo-av';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import useSoundStore from '../store/soundStore';

const BACKGROUND_AUDIO_TASK = 'BACKGROUND_AUDIO_TASK';

// Arka plan görevini tanımla
TaskManager.defineTask(BACKGROUND_AUDIO_TASK, async () => {
  // Arka planda çalışması için gerekli işlemleri yap
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export default function useBackgroundAudio() {
  const { isBackgroundPlayActive, sounds } = useSoundStore();

  useEffect(() => {
    // Audio modu ayarla
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    };

    setupAudio();

    // Arka plan görevini kaydet
    const registerBackgroundTask = async () => {
      if (isBackgroundPlayActive) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_AUDIO_TASK, {
          minimumInterval: 60, // 1 dakika
          stopOnTerminate: false,
          startOnBoot: true,
        });
      } else {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_AUDIO_TASK);
      }
    };

    registerBackgroundTask();

    // Temizlik fonksiyonu
    return () => {
      if (isBackgroundPlayActive) {
        BackgroundFetch.unregisterTaskAsync(BACKGROUND_AUDIO_TASK);
      }
    };
  }, [isBackgroundPlayActive]);

  // Uygulama kapatıldığında sesleri duraklatma/devam ettirme işlemi için
  useEffect(() => {
    const subscription = Audio.setIsEnabledAsync(true);
    
    return () => {
      // isBackgroundPlayActive true ise sesleri kapatma
      if (!isBackgroundPlayActive) {
        sounds.forEach(sound => {
          if (sound.sound && sound.isPlaying) {
            sound.sound.pauseAsync();
          }
        });
      }
    };
  }, []);
} 