import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, Image } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Create tab navigator
const Tab = createBottomTabNavigator();

// Sound data defined globally
const allSoundsData = [
  // Doğa Sesleri Kategorisi
  { id: 'rain', name: 'Yağmur', icon: 'rainy', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'waves', name: 'Dalga', icon: 'water', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'wind', name: 'Rüzgar', icon: 'leaf', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'forest', name: 'Orman', icon: 'leaf', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'waterfall', name: 'Şelale', icon: 'water', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'summernight', name: 'Yaz Gecesi', icon: 'moon', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'birds', name: 'Kuş Sesleri', icon: 'musical-note', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'thunderstorm', name: 'Gök Gürültüsü', icon: 'cloud', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'fire', name: 'Şömine', icon: 'bonfire', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  { id: 'seaside', name: 'Deniz Kenarı', icon: 'water', category: 'doğa', volume: 0.5, isPlaying: false, sound: null },
  
  // Ortam Sesleri Kategorisi
  { id: 'cafe', name: 'Kahve Dükkanı', icon: 'cafe', category: 'ortam', volume: 0.5, isPlaying: false, sound: null },
  { id: 'library', name: 'Kütüphane', icon: 'book', category: 'ortam', volume: 0.5, isPlaying: false, sound: null },
  { id: 'garden', name: 'Bahçe', icon: 'leaf', category: 'ortam', volume: 0.5, isPlaying: false, sound: null },
  { id: 'rainywindow', name: 'Yağmurlu Pencere', icon: 'rainy', category: 'ortam', volume: 0.5, isPlaying: false, sound: null },
  
  // Meditasyon Sesleri Kategorisi
  { id: 'tibetbowls', name: 'Tibet Çanları', icon: 'musical-note', category: 'meditasyon', volume: 0.5, isPlaying: false, sound: null },
  { id: 'ohm', name: 'Ohm Sesi', icon: 'ellipse', category: 'meditasyon', volume: 0.5, isPlaying: false, sound: null },
  { id: 'space', name: 'Uzay Ambiyansı', icon: 'planet', category: 'meditasyon', volume: 0.5, isPlaying: false, sound: null },
  
  // Gürültü Sesleri Kategorisi
  { id: 'whitenoise', name: 'Beyaz Gürültü', icon: 'radio-button-on', category: 'gürültü', volume: 0.5, isPlaying: false, sound: null },
  { id: 'pinknoise', name: 'Pembe Gürültü', icon: 'pulse', category: 'gürültü', volume: 0.5, isPlaying: false, sound: null },
  { id: 'brownnoise', name: 'Kahverengi Gürültü', icon: 'pulse', category: 'gürültü', volume: 0.5, isPlaying: false, sound: null },
  
  // Enstrüman Sesleri Kategorisi
  { id: 'piano', name: 'Piyano', icon: 'musical-notes', category: 'enstrüman', volume: 0.5, isPlaying: false, sound: null },
  { id: 'guitar', name: 'Gitar', icon: 'musical-note', category: 'enstrüman', volume: 0.5, isPlaying: false, sound: null },
  { id: 'flute', name: 'Flüt/Ney', icon: 'musical-note', category: 'enstrüman', volume: 0.5, isPlaying: false, sound: null },
  { id: 'harp', name: 'Harp', icon: 'musical-note', category: 'enstrüman', volume: 0.5, isPlaying: false, sound: null },
  
  // Karışım Sesleri Kategorisi
  { id: 'rainpiano', name: 'Yağmur ve Piyano', icon: 'musical-notes', category: 'karışım', volume: 0.5, isPlaying: false, sound: null },
  { id: 'nighttrain', name: 'Gece Treni', icon: 'train', category: 'karışım', volume: 0.5, isPlaying: false, sound: null },
  { id: 'meditationmix', name: 'Meditasyon Karışımı', icon: 'flower', category: 'karışım', volume: 0.5, isPlaying: false, sound: null },
];

// Sound files map
const soundFiles = {
  // Mevcut sesler
  rain: require('./assets/sounds/rain.mp3'),
  waves: require('./assets/sounds/waves.mp3'),
  wind: require('./assets/sounds/wind.mp3'),
  forest: require('./assets/sounds/forest.mp3'),
  whitenoise: require('./assets/sounds/whitenoise.mp3'),
  
  // Yeni sesler için yer tutucular (gerçek uygulamada bunlar gerçek ses dosyaları olacaktır)
  waterfall: require('./assets/sounds/rain.mp3'),  // Geçici olarak mevcut sesleri kullanıyoruz
  summernight: require('./assets/sounds/rain.mp3'),
  birds: require('./assets/sounds/rain.mp3'),
  thunderstorm: require('./assets/sounds/rain.mp3'),
  fire: require('./assets/sounds/rain.mp3'),
  seaside: require('./assets/sounds/waves.mp3'),
  
  cafe: require('./assets/sounds/rain.mp3'),
  library: require('./assets/sounds/rain.mp3'),
  garden: require('./assets/sounds/wind.mp3'),
  rainywindow: require('./assets/sounds/rain.mp3'),
  
  tibetbowls: require('./assets/sounds/rain.mp3'),
  ohm: require('./assets/sounds/rain.mp3'),
  pinknoise: require('./assets/sounds/whitenoise.mp3'),
  brownnoise: require('./assets/sounds/whitenoise.mp3'),
  space: require('./assets/sounds/rain.mp3'),
  
  piano: require('./assets/sounds/rain.mp3'),
  guitar: require('./assets/sounds/rain.mp3'),
  flute: require('./assets/sounds/rain.mp3'),
  harp: require('./assets/sounds/rain.mp3'),
  
  rainpiano: require('./assets/sounds/rain.mp3'),
  nighttrain: require('./assets/sounds/rain.mp3'),
  meditationmix: require('./assets/sounds/rain.mp3'),
};

// Sound colors for UI
const soundColors = {
  // Mevcut renkler
  rain: '#3498db',    // Mavi
  waves: '#1abc9c',   // Turkuaz
  wind: '#9b59b6',    // Mor
  forest: '#2ecc71',  // Yeşil
  whitenoise: '#e74c3c', // Kırmızı
  
  // Yeni sesler için renkler (kategorilere göre gruplandırılmış)
  // Doğa - maviler/yeşiller
  waterfall: '#3498db',
  summernight: '#34495e',
  birds: '#1abc9c',
  thunderstorm: '#2980b9',
  fire: '#e67e22',
  seaside: '#1abc9c',
  
  // Ortam - morlar/maviler
  cafe: '#9b59b6',
  library: '#8e44ad',
  garden: '#2ecc71',
  rainywindow: '#3498db',
  
  // Meditasyon - turuncular/kırmızılar
  tibetbowls: '#e67e22',
  ohm: '#d35400',
  pinknoise: '#e74c3c',
  brownnoise: '#c0392b',
  space: '#34495e',
  
  // Enstrüman - sarılar/yeşiller
  piano: '#f1c40f',
  guitar: '#f39c12',
  flute: '#27ae60',
  harp: '#f1c40f',
  
  // Karışım - renk karışımları
  rainpiano: '#3498db',
  nighttrain: '#34495e',
  meditationmix: '#e67e22',
};

// Main App Component that includes the sound state management
export default function App() {
  // Global state for all sounds and selected sounds
  const [allSounds, setAllSounds] = useState(allSoundsData);
  const [selectedSoundIds, setSelectedSoundIds] = useState([]);
  const [isBackgroundPlayActive, setIsBackgroundPlayActive] = useState(false);
  
  // Load saved settings when app starts
  useEffect(() => {
    setupAudio();
    loadSettings();
    
    return () => {
      unloadAllSounds();
    };
  }, []);
  
  // Setup audio mode
  const setupAudio = async () => {
    try {
      await updateAudioMode();
      await preloadSounds();
    } catch (error) {
      console.error('Error setting audio mode:', error);
      Alert.alert('Ses Hatası', 'Ses ayarları yapılandırılırken bir hata oluştu.');
    }
  };
  
  // New function to update audio mode based on background play setting
  const updateAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: isBackgroundPlayActive,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error updating audio mode:', error);
    }
  };
  
  // Preload sound files
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
  
  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      // Load selected sound IDs
      const savedSelectedSoundIds = await AsyncStorage.getItem('selectedSoundIds');
      if (savedSelectedSoundIds) {
        // Initialize with empty array instead of saved sounds to ensure no default sounds
        // Comment out the line below to prevent loading saved selected sounds
        // setSelectedSoundIds(JSON.parse(savedSelectedSoundIds));
        setSelectedSoundIds([]);
      }
      
      // Load sound settings
      const savedSettings = await AsyncStorage.getItem('soundSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        const updatedSounds = [...allSounds];
        settings.sounds.forEach(savedSound => {
          const soundIndex = updatedSounds.findIndex(s => s.id === savedSound.id);
          if (soundIndex !== -1) {
            updatedSounds[soundIndex].volume = savedSound.volume;
            updatedSounds[soundIndex].isPlaying = false; // Make sure no sound is playing by default
          }
        });
        
        setAllSounds(updatedSounds);
        setIsBackgroundPlayActive(settings.isBackgroundPlayActive);
        
        // Comment out the code below to prevent playing sounds on startup
        /*
        // Start playing active sounds
        updatedSounds.forEach(sound => {
          if (sound.isPlaying) {
            playSound(sound.id);
          }
        });
        */
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };
  
  // Save settings to AsyncStorage
  const saveSettings = async () => {
    try {
      // Save selected sound IDs
      await AsyncStorage.setItem('selectedSoundIds', JSON.stringify(selectedSoundIds));
      
      // Save sound settings
      const settingsToSave = {
        sounds: allSounds.map(({ id, volume, isPlaying }) => ({ id, volume, isPlaying })),
        isBackgroundPlayActive,
      };
      await AsyncStorage.setItem('soundSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };
  
  // Toggle sound selection for home screen
  const toggleSoundSelection = (id) => {
    if (selectedSoundIds.includes(id)) {
      // Remove from selected
      setSelectedSoundIds(selectedSoundIds.filter(soundId => soundId !== id));
    } else {
      // Add to selected
      setSelectedSoundIds([...selectedSoundIds, id]);
    }
    // Save the changes
    setTimeout(saveSettings, 100);
  };
  
  // Play a sound
  const playSound = async (id) => {
    try {
      const newSounds = [...allSounds];
      const soundIndex = newSounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1) return;
      
      let { sound: soundObject } = newSounds[soundIndex];
      
      // Create sound object if it doesn't exist
      if (!soundObject) {
        try {
          const soundFile = soundFiles[id];
          
          // Unload any existing sound
          if (newSounds[soundIndex].sound) {
            await newSounds[soundIndex].sound.unloadAsync();
          }
          
          // Create and load the sound
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
          
          // Play the sound
          await sound.playAsync();
          
          soundObject = sound;
          newSounds[soundIndex].sound = soundObject;
        } catch (e) {
          console.error(`Ses dosyasını yüklerken hata (${id}):`, e);
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
          // Reload if not loaded
          await soundObject.unloadAsync();
          newSounds[soundIndex].sound = null;
          return playSound(id);
        }
      }
      
      newSounds[soundIndex].isPlaying = true;
      setAllSounds(newSounds);
      saveSettings();
      
    } catch (error) {
      console.error('Failed to play sound', error);
      Alert.alert('Hata', 'Ses dosyası çalınamadı.');
    }
  };
  
  // Pause a sound
  const pauseSound = async (id) => {
    try {
      const newSounds = [...allSounds];
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
      setAllSounds(newSounds);
      saveSettings();
    } catch (error) {
      console.error(`Failed to pause sound ${id}:`, error);
    }
  };
  
  // Adjust volume for a sound
  const adjustVolume = async (id, volume) => {
    try {
      const newSounds = [...allSounds];
      const soundIndex = newSounds.findIndex(s => s.id === id);
      
      if (soundIndex === -1) return;
      
      newSounds[soundIndex].volume = volume;
      
      if (newSounds[soundIndex].sound) {
        await newSounds[soundIndex].sound.setVolumeAsync(volume);
      }
      
      setAllSounds(newSounds);
      saveSettings();
    } catch (error) {
      console.error('Failed to adjust volume', error);
    }
  };
  
  // Toggle background play setting
  const toggleBackgroundPlay = async (value) => {
    setIsBackgroundPlayActive(value);
    
    // Update audio mode when the setting changes
    await updateAudioMode();
    
    // If turning off background play and app is going to background, pause all sounds
    if (!value) {
      // Pause all playing sounds if background play is disabled
      const playingSounds = allSounds.filter(sound => sound.isPlaying);
      for (const sound of playingSounds) {
        await pauseSound(sound.id);
      }
    }
    
    setTimeout(saveSettings, 100);
  };
  
  // Unload all sounds
  const unloadAllSounds = async () => {
    try {
      for (const sound of allSounds) {
        if (sound.sound) {
          await sound.sound.unloadAsync();
        }
      }
      
      const updatedSounds = allSounds.map(sound => ({
        ...sound,
        sound: null,
      }));
      
      setAllSounds(updatedSounds);
    } catch (error) {
      console.error('Failed to unload sounds', error);
    }
  };
  
  // Filter sounds for home screen based on selection
  const getSelectedSounds = () => {
    return allSounds.filter(sound => selectedSoundIds.includes(sound.id));
  };

  // Render tab navigator
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Ana Sayfa') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Keşfet') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Yapay Zeka') {
              iconName = focused ? 'flash' : 'flash-outline';
            } else if (route.name === 'Ayarlar') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#333',
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
            elevation: 10,
            shadowOpacity: 0.3,
            shadowRadius: 3,
            shadowOffset: {
              width: 0,
              height: -2,
            },
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '500',
            paddingBottom: 3,
            marginTop: -3,
          },
          tabBarIconStyle: {
            marginBottom: -3,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Ana Sayfa">
          {(props) => <SoundsScreen 
            {...props} 
            sounds={getSelectedSounds()} 
            playSound={playSound} 
            pauseSound={pauseSound} 
            adjustVolume={adjustVolume} 
            soundColors={soundColors}
            navigation={props.navigation}
            toggleSoundSelection={toggleSoundSelection}
          />}
        </Tab.Screen>
        <Tab.Screen name="Keşfet">
          {(props) => <DiscoverScreen 
            {...props} 
            allSounds={allSounds} 
            selectedSoundIds={selectedSoundIds}
            toggleSoundSelection={toggleSoundSelection}
            playSound={playSound}
            pauseSound={pauseSound}
            adjustVolume={adjustVolume}
            soundColors={soundColors}
          />}
        </Tab.Screen>
        <Tab.Screen name="Yapay Zeka" component={AIScreen} />
        <Tab.Screen name="Ayarlar">
          {(props) => <SettingsScreen 
            {...props} 
            isBackgroundPlayActive={isBackgroundPlayActive}
            toggleBackgroundPlay={toggleBackgroundPlay}
          />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Sounds Screen Component (Home)
function SoundsScreen({ sounds, playSound, pauseSound, adjustVolume, soundColors, navigation, toggleSoundSelection }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Ana Sayfa</Text>
        <Text style={styles.subtitle}>Seçtiğiniz rahatlatıcı sesler</Text>
      </View>
      
      <ScrollView style={styles.soundList}>
        {sounds.length > 0 ? (
          <>
            {sounds.map((sound) => (
              <View key={sound.id} style={[
                styles.soundCard, 
                { borderLeftColor: soundColors[sound.id] }
              ]}>
                <View style={styles.soundHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${soundColors[sound.id]}30` }]}>
                    <Ionicons 
                      name={sound.icon} 
                      size={24} 
                      color={soundColors[sound.id]} 
                    />
                  </View>
                  <Text style={styles.soundName}>{sound.name}</Text>
                  
                  <View style={styles.soundButtonsContainer}>
                    {/* Play/Pause button */}
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
                    
                    {/* Remove button */}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => toggleSoundSelection(sound.id)}
                    >
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
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
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="musical-note" size={64} color="#555" />
            <Text style={styles.emptyStateTitle}>Henüz ses eklemediniz</Text>
            <Text style={styles.emptyStateText}>
              Keşfet sekmesinden beğendiğiniz sesleri ana sayfanıza ekleyin
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Keşfet')}
            >
              <Text style={styles.emptyStateButtonText}>Keşfet</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Discover Screen Component
function DiscoverScreen({ allSounds, selectedSoundIds, toggleSoundSelection, playSound, pauseSound, soundColors, adjustVolume }) {
  // Function to preview sounds
  const [previewingSound, setPreviewingSound] = useState(null);
  const [originalVolumes, setOriginalVolumes] = useState({});
  const PREVIEW_VOLUME = 0.7; // Fixed volume level for previews (70%)
  
  // Seçili kategoriyi takip eden state
  const [selectedCategory, setSelectedCategory] = useState('doğa'); // Varsayılan olarak 'doğa' kategorisi
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  // Kategori isimleri (Türkçe karakterler ve büyük harfler için)
  const categoryNames = {
    'doğa': 'Doğa Sesleri',
    'ortam': 'Ortam Sesleri',
    'meditasyon': 'Meditasyon Sesleri',
    'enstrüman': 'Enstrüman Sesleri',
    'gürültü': 'Gürültü Sesleri',
    'karışım': 'Karışımlar'
  };
  
  // Mevcut tüm kategorileri al
  const categories = Object.keys(categoryNames);
  
  // Seçili kategoriye göre sesleri filtreleme
  const filteredSounds = allSounds.filter(sound => sound.category === selectedCategory);
  
  // Kategori seçme fonksiyonu
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setDropdownVisible(false);
  };
  
  const handlePreview = async (sound) => {
    if (previewingSound === sound.id) {
      // If the same sound is playing, pause it and restore original volume
      pauseSound(sound.id);
      
      // Restore original volume if it was saved
      if (originalVolumes[sound.id] !== undefined) {
        await adjustVolume(sound.id, originalVolumes[sound.id]);
      }
      
      setPreviewingSound(null);
    } else {
      // Stop current preview if any and restore its volume
      if (previewingSound) {
        pauseSound(previewingSound);
        
        // Restore original volume of previously previewing sound
        if (originalVolumes[previewingSound] !== undefined) {
          await adjustVolume(previewingSound, originalVolumes[previewingSound]);
        }
      }
      
      // Save current volume before changing it
      const soundIndex = allSounds.findIndex(s => s.id === sound.id);
      if (soundIndex !== -1) {
        const currentVolume = allSounds[soundIndex].volume;
        setOriginalVolumes({
          ...originalVolumes,
          [sound.id]: currentVolume
        });
        
        // Set to fixed preview volume
        await adjustVolume(sound.id, PREVIEW_VOLUME);
      }
      
      // Play the sound at preview volume
      playSound(sound.id);
      setPreviewingSound(sound.id);
    }
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Restore original volumes for any previewing sound when leaving the screen
      if (previewingSound && originalVolumes[previewingSound] !== undefined) {
        pauseSound(previewingSound);
        adjustVolume(previewingSound, originalVolumes[previewingSound]);
      }
    };
  }, [previewingSound, originalVolumes]);
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Keşfet</Text>
        <Text style={styles.subtitle}>Kategorilere göre sesler</Text>
      </View>
      
      {/* Kategori dropdown menüsü */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownButtonText}>{categoryNames[selectedCategory]}</Text>
          <Ionicons 
            name={dropdownVisible ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#CCC" 
          />
        </TouchableOpacity>
        
        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.dropdownItem,
                  selectedCategory === category ? styles.dropdownItemActive : {}
                ]}
                onPress={() => selectCategory(category)}
              >
                <Text 
                  style={[
                    styles.dropdownItemText,
                    selectedCategory === category ? styles.dropdownItemTextActive : {}
                  ]}
                >
                  {categoryNames[category]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      {/* Seçili kategorideki sesler */}
      <ScrollView style={styles.soundList}>
        <View style={styles.categoryContent}>
          {filteredSounds.map(sound => (
            <View key={sound.id} style={[
              styles.discoverCard, 
              { borderLeftColor: soundColors[sound.id] }
            ]}>
              <View style={styles.soundHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${soundColors[sound.id]}30` }]}>
                  <Ionicons 
                    name={sound.icon} 
                    size={20} 
                    color={soundColors[sound.id]} 
                  />
                </View>
                <Text style={styles.soundName}>{sound.name}</Text>
                
                <View style={styles.buttonContainer}>
                  {/* Add/Remove from Home button */}
                  <TouchableOpacity
                    style={[
                      styles.toggleHomeButton,
                      selectedSoundIds.includes(sound.id) ? styles.removeHomeButton : styles.addHomeButton
                    ]}
                    onPress={() => toggleSoundSelection(sound.id)}
                  >
                    <Ionicons 
                      name={selectedSoundIds.includes(sound.id) ? "remove" : "add"} 
                      size={16} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  
                  {/* Preview button */}
                  <TouchableOpacity
                    onPress={() => handlePreview(sound)}
                    style={[styles.previewButton, previewingSound === sound.id ? styles.pauseButton : styles.previewButton]}
                  >
                    <Ionicons 
                      name={previewingSound === sound.id ? "pause" : "play"} 
                      size={16} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {filteredSounds.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#555" />
              <Text style={styles.emptyStateTitle}>Bu kategoride ses bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Farklı bir kategori seçmeyi deneyin
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// AI Screen Component (Coming Soon)
function AIScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Yapay Zeka</Text>
        <Text style={styles.subtitle}>Akıllı özellikler çok yakında</Text>
      </View>
      
      <View style={styles.aiComingSoonContainer}>
        <View style={styles.aiIconContainer}>
          <Ionicons name="analytics" size={80} color="#9C27B0" />
        </View>
        
        <Text style={styles.aiComingSoonTitle}>Çok Yakında!</Text>
        
        <Text style={styles.aiComingSoonText}>
          Yapay zeka destekli özel ses önerileri ve kişiselleştirilmiş deneyim için hazırlıklar sürüyor. 
          Çok yakında yapay zeka ile daha akıllı bir rahatlatıcı ses deneyimi sunacağız.
        </Text>
        
        <View style={styles.aiFeatureList}>
          <View style={styles.aiFeatureItem}>
            <Ionicons name="person" size={24} color="#4CAF50" style={styles.aiFeatureIcon} />
            <Text style={styles.aiFeatureText}>
              Kişiselleştirilmiş öneri sistemi
            </Text>
          </View>
          
          <View style={styles.aiFeatureItem}>
            <Ionicons name="analytics" size={24} color="#FF9800" style={styles.aiFeatureIcon} />
            <Text style={styles.aiFeatureText}>
              Akıllı ses kombinasyonları
            </Text>
          </View>
          
          <View style={styles.aiFeatureItem}>
            <Ionicons name="time" size={24} color="#3F51B5" style={styles.aiFeatureIcon} />
            <Text style={styles.aiFeatureText}>
              Zamanlayıcı ve uyku asistanı
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Settings Screen Component
function SettingsScreen({ isBackgroundPlayActive, toggleBackgroundPlay }) {
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Uygulama ayarlarını özelleştirin</Text>
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
          <TouchableOpacity 
            style={styles.aboutButton}
            onPress={() => setAboutModalVisible(true)}
          >
            <Text style={styles.aboutButtonText}>Hakkında</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* About Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAboutModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="musical-notes" size={64} color="#4CAF50" />
              </View>
              
              <Text style={styles.modalTitle}>Rahatlatıcı Sesler</Text>
              <Text style={styles.modalVersion}>Versiyon 1.0.0</Text>
              
              <Text style={styles.modalDescription}>
                Bu uygulama rahatlatıcı sesler ile dinlenmenize ve konsantre olmanıza yardımcı 
                olmak için tasarlanmıştır. Doğa ve ambiyans sesleri ile rahatlayın, odaklanın
                veya uykunuzu düzene sokun.
              </Text>
              
              <View style={styles.modalDivider} />
              
              <Text style={styles.modalDevelopedBy}>
                © 2023 | Tüm Hakları Saklıdır
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
  },
  soundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
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
  soundButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Space between buttons
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
  previewButton: {
    backgroundColor: '#9C27B0',
    width: 40,
    height: 40,
    borderRadius: 20,
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
  // Discover screen styles
  discoverContent: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  discoverCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  toggleHomeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  addHomeButton: {
    backgroundColor: '#4CAF50',
  },
  removeHomeButton: {
    backgroundColor: '#F44336',
  },
  // Additional settings styles
  aboutButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  aboutButtonText: {
    color: 'white',
    fontSize: 14,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 24,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#666',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalVersion: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#333',
    marginBottom: 16,
  },
  modalDevelopedBy: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // AI Screen Styles
  aiComingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  aiIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  aiComingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  aiComingSoonText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  aiFeatureList: {
    width: '100%',
  },
  aiFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  aiFeatureIcon: {
    marginRight: 16,
  },
  aiFeatureText: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  // Küçültülmüş kartlar için stil güncelleme
  discoverCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 3,
  },
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  soundName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  toggleHomeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  previewButton: {
    backgroundColor: '#9C27B0',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  // Dropdown stilleri
  dropdownContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#262626',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  dropdownItemText: {
    color: '#CCC',
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: '#4CAF50',
    fontWeight: '700',
  },
}); 