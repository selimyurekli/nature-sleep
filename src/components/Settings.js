import React from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import useSoundStore from '../store/soundStore';

const Settings = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { isBackgroundPlayActive, toggleBackgroundPlay } = useSoundStore();

  return (
    <View 
      className="flex-1 bg-gray-900" 
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-800">
        <Text className="text-white text-xl font-bold">Ayarlar</Text>
        <TouchableOpacity onPress={onClose}>
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
          <View>
            <Text className="text-white text-lg">Arka Planda Çalma</Text>
            <Text className="text-gray-400 text-sm">
              Uygulama kapatıldığında seslerin çalmaya devam etmesini sağlar
            </Text>
          </View>
          <Switch
            value={isBackgroundPlayActive}
            onValueChange={(value) => {
              if (value) {
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
            trackColor={{ false: "#444", true: "#007AFF" }}
            thumbColor="#f4f3f4"
          />
        </View>

        <View className="mt-8">
          <Text className="text-gray-400 text-center">
            Rahatlatıcı Sesler Uygulaması v1.0.0
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Settings; 