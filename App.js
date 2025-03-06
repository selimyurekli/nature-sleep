import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function App() {
  const [sounds, setSounds] = useState([
    { id: 'rain', name: 'Yağmur', icon: 'cloud-rain', volume: 0.5, isPlaying: false, sound: null },
    { id: 'waves', name: 'Dalga', icon: 'water', volume: 0.5, isPlaying: false, sound: null },
    { id: 'wind', name: 'Rüzgar', icon: 'wind', volume: 0.5, isPlaying: false, sound: null },
    { id: 'forest', name: 'Orman', icon: 'tree', volume: 0.5, isPlaying: false, sound: null },
    { id: 'whitenoise', name: 'Beyaz Gürültü', icon: 'asterisk', volume: 0.5, isPlaying: false, sound: null },
  ]);
  
  const [isBackgroundPlayActive, setIsBackgroundPlayActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const soundFiles = {
    rain: require('./assets/sounds/rain.mp3'),
    waves: require('./assets/sounds/waves.mp3'),
    wind: require('./assets/sounds/wind.mp3'),
    forest: require('./assets/sounds/forest.mp3'),
    whitenoise: require('./assets/sounds/whitenoise.mp3'),
  };

  // Verify sound files are accessible
  useEffect(() => {
    const verifySoundFiles = () => {
      for (const id in soundFiles) {
        if (!soundFiles[id]) {
          console.error(`Sound file for ${id} is not accessible`);
        }
      }
    };
    
    verifySoundFiles();
  }, []);

  // Ses modunu ayarla
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });
        
        // Preload sound files
        await preloadSounds();
      } catch (error) {
        console.error('Error setting audio mode:', error);
        Alert.alert('Ses Hatası', 'Ses ayarları yapılandırılırken bir hata oluştu.');
      }
    };

    setupAudio();
    loadSettings();

    return () => {
      // Uygulama kapanırken sesleri temizle
      unloadAllSounds();
    };
  }, []);

  // Preload sound files to ensure they're available
  const preloadSounds = async () => {
    try {
      for (const id in soundFiles) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            soundFiles[id],
            { volume: 0 },
            null
          );
          await sound.unloadAsync();
        } catch (error) {
          console.error(`Error preloading sound ${id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in preloading sounds:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('soundSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        const updatedSounds = sounds.map(sound => {
          const savedSound = settings.sounds.find(s => s.id === sound.id);
          if (savedSound) {
            return { ...sound, volume: savedSound.volume, isPlaying: savedSound.isPlaying };
          }
          return sound;
        });
        
        setSounds(updatedSounds);
        setIsBackgroundPlayActive(settings.isBackgroundPlayActive);
        
        // Eğer aktif sesler varsa, onları başlat
        updatedSounds.forEach(sound => {
          if (sound.isPlaying) {
            playSound(sound.id);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsToSave = {
        sounds: sounds.map(({ id, volume, isPlaying }) => ({ id, volume, isPlaying })),
        isBackgroundPlayActive,
      };
      await AsyncStorage.setItem('soundSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const playSound = async (id) => {
    try {
      const newSounds = [...sounds];
      const soundIndex = newSounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1) return;
      
      let { sound: soundObject } = newSounds[soundIndex];
      
      // Ses nesnesi yoksa oluştur
      if (!soundObject) {
        try {
          const soundFile = soundFiles[id];
          
          // First unload any existing sound to prevent issues
          if (newSounds[soundIndex].sound) {
            await newSounds[soundIndex].sound.unloadAsync();
          }
          
          // Create and load the sound with explicit options
          const { sound } = await Audio.Sound.createAsync(
            soundFile,
            { 
              isLooping: true, 
              volume: newSounds[soundIndex].volume,
              shouldPlay: true,
              progressUpdateIntervalMillis: 1000,
              positionMillis: 0,
              rate: 1.0,
              shouldCorrectPitch: false,
            },
            (status) => {
              if (status.error) {
                console.error(`Error playing ${id}:`, status.error);
              }
            }
          );
          
          // Explicitly play the sound
          await sound.playAsync();
          
          soundObject = sound;
          newSounds[soundIndex].sound = soundObject;
        } catch (e) {
          console.error(`Ses dosyasını yüklerken hata (${id}):`, e);
          // Ses dosyası yüklenemedi, hata göster
          Alert.alert('Hata', `Ses dosyası yüklenirken bir sorun oluştu: ${e.message}`);
          return;
        }
      } else {
        // Get current status
        const status = await soundObject.getStatusAsync();
        
        if (status.isLoaded) {
          if (!status.isPlaying) {
            await soundObject.playAsync();
          }
        } else {
          // Reload the sound if it's not loaded
          await soundObject.unloadAsync();
          newSounds[soundIndex].sound = null;
          // Recursively call playSound to create a new sound
          return playSound(id);
        }
      }
      
      newSounds[soundIndex].isPlaying = true;
      setSounds(newSounds);
      saveSettings();
      
    } catch (error) {
      console.error('Failed to play sound', error);
      Alert.alert('Hata', 'Ses dosyası çalınamadı.');
    }
  };

  const pauseSound = async (id) => {
    try {
      const newSounds = [...sounds];
      const soundIndex = newSounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1 || !newSounds[soundIndex].sound) {
        return;
      }
      
      // Get current status
      const status = await newSounds[soundIndex].sound.getStatusAsync();
      
      if (status.isLoaded && status.isPlaying) {
        await newSounds[soundIndex].sound.pauseAsync();
      }
      
      newSounds[soundIndex].isPlaying = false;
      setSounds(newSounds);
      saveSettings();
      
    } catch (error) {
      console.error(`Failed to pause sound ${id}:`, error);
    }
  };

  const adjustVolume = async (id, volume) => {
    try {
      const newSounds = [...sounds];
      const soundIndex = newSounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1) return;
      
      newSounds[soundIndex].volume = volume;
      
      if (newSounds[soundIndex].sound) {
        await newSounds[soundIndex].sound.setVolumeAsync(volume);
      }
      
      setSounds(newSounds);
      saveSettings();
      
    } catch (error) {
      console.error('Failed to adjust volume', error);
    }
  };

  const toggleBackgroundPlay = (value) => {
    setIsBackgroundPlayActive(value);
    saveSettings();
  };

  const unloadAllSounds = async () => {
    try {
      for (const sound of sounds) {
        if (sound.sound) {
          await sound.sound.unloadAsync();
        }
      }
      
      const updatedSounds = sounds.map(sound => ({
        ...sound,
        sound: null,
      }));
      
      setSounds(updatedSounds);
      
    } catch (error) {
      console.error('Failed to unload sounds', error);
    }
  };

  // Ana ekranda soundCard için her sese özel renk
  const soundColors = {
    rain: '#3498db',    // Mavi
    waves: '#1abc9c',   // Turkuaz
    wind: '#9b59b6',    // Mor
    forest: '#2ecc71',  // Yeşil
    whitenoise: '#e74c3c', // Kırmızı
  };

  // Ayarlar Ekranı
  if (showSettings) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Arka Planda Çalma</Text>
              <Text style={styles.settingDescription}>
                Uygulama kapatıldığında seslerin çalmaya devam etmesini sağlar
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.toggle, 
                isBackgroundPlayActive ? 
                  { backgroundColor: '#4CAF50', shadowColor: '#4CAF50', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 } : 
                  styles.toggleInactive
              ]}
              onPress={() => {
                if (!isBackgroundPlayActive) {
                  Alert.alert(
                    "Uyarı",
                    "Arka planda çalma özelliği, cihaz pil tüketimini artırabilir.",
                    [
                      { text: "İptal", style: "cancel" },
                      { text: "Devam Et", onPress: () => toggleBackgroundPlay(true) }
                    ]
                  );
                } else {
                  toggleBackgroundPlay(false);
                }
              }}
            >
              <View style={[styles.toggleHandle, isBackgroundPlayActive ? styles.toggleHandleRight : styles.toggleHandleLeft]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Rahatlatıcı Sesler Uygulaması v1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Ana Ekran
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Rahatlatıcı Sesler</Text>
        <Text style={styles.subtitle}>Dinlenmeniz için huzur verici sesler</Text>
      </View>
      
      <ScrollView style={styles.soundList}>
        {sounds.map((sound) => (
          <View key={sound.id} style={[
            styles.soundCard, 
            { borderLeftColor: soundColors[sound.id] }
          ]}>
            <View style={styles.soundHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${soundColors[sound.id]}30` }]}>
                <FontAwesome5 
                  name={sound.icon} 
                  size={24} 
                  color={soundColors[sound.id]} 
                />
              </View>
              <Text style={styles.soundName}>{sound.name}</Text>
              <TouchableOpacity
                onPress={() => sound.isPlaying ? pauseSound(sound.id) : playSound(sound.id)}
                style={[styles.playButton, sound.isPlaying ? styles.pauseButton : styles.playButton]}
              >
                <Ionicons 
                  name={sound.isPlaying ? "pause" : "play"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.volumeControl}>
              <Ionicons name="volume-low" size={20} color="#888" />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={sound.volume}
                onValueChange={(value) => adjustVolume(sound.id, value)}
                minimumTrackTintColor={soundColors[sound.id]}
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor={soundColors[sound.id]}
              />
              <Text style={styles.volumeText}>{Math.round(sound.volume * 100)}</Text>
            </View>
          </View>
        ))}
        <View style={styles.masterControls}>
          <TouchableOpacity 
            style={styles.masterButton}
            onPress={() => {
              const allPlaying = sounds.every(s => s.isPlaying);
              sounds.forEach(sound => {
                if (allPlaying) {
                  pauseSound(sound.id);
                } else {
                  playSound(sound.id);
                }
              });
            }}
          >
            <Ionicons 
              name={sounds.some(s => s.isPlaying) ? "pause-circle" : "play-circle"} 
              size={32} 
              color="white" 
            />
            <Text style={styles.masterButtonText}>
              {sounds.some(s => s.isPlaying) ? "Tümünü Durdur" : "Tümünü Çal"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setShowSettings(true)}
      >
        <Ionicons name="settings-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 0.5,
  },
  soundList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  soundCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  soundName: {
    flex: 1,
    marginLeft: 15,
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
    elevation: 5,
  },
  pauseButton: {
    backgroundColor: '#F44336',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  volumeText: {
    color: '#AAA',
    width: 30,
    textAlign: 'right',
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3F51B5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5.46,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    color: '#AAA',
    width: width * 0.6,
    lineHeight: 20,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleInactive: {
    backgroundColor: '#555',
  },
  toggleHandle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
  },
  toggleHandleLeft: {
    alignSelf: 'flex-start',
  },
  toggleHandleRight: {
    alignSelf: 'flex-end',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#AAA',
    fontSize: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 16,
    marginTop: 5,
  },
  masterControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  masterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  masterButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
}); 