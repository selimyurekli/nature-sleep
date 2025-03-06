import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { AntDesign } from '@expo/vector-icons';
import useSoundStore from '../store/soundStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SoundMixer = () => {
  const { sounds, playSound, pauseSound, adjustVolume } = useSoundStore();
  const insets = useSafeAreaInsets();

  const soundIcons = {
    rain: require('../assets/icons/rain.png'),
    waves: require('../assets/icons/waves.png'),
    wind: require('../assets/icons/wind.png'),
    forest: require('../assets/icons/forest.png'),
    whitenoise: require('../assets/icons/whitenoise.png'),
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 20 }}
    >
      <Text className="text-white text-2xl font-bold text-center my-6">
        Rahatlatıcı Sesler
      </Text>

      <View className="px-4">
        {sounds.map((sound) => (
          <View key={sound.id} className="bg-gray-800 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <AntDesign name="sound" size={24} color="white" className="mr-4" />
              <Text className="text-white text-lg flex-1">{sound.name}</Text>
              <TouchableOpacity
                onPress={() => sound.isPlaying ? pauseSound(sound.id) : playSound(sound.id)}
                className={`rounded-full p-2 ${sound.isPlaying ? 'bg-red-500' : 'bg-green-500'}`}
              >
                <AntDesign 
                  name={sound.isPlaying ? 'pausecircle' : 'playcircleo'} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <AntDesign name="sound" size={20} color="gray" />
              <Slider
                style={{ flex: 1, height: 40, marginHorizontal: 10 }}
                minimumValue={0}
                maximumValue={1}
                value={sound.volume}
                onValueChange={(value) => adjustVolume(sound.id, value)}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#444444"
                thumbTintColor="#FFFFFF"
              />
              <Text className="text-gray-400 w-8 text-right">{Math.round(sound.volume * 100)}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default SoundMixer; 