import { Tabs } from 'expo-router';
import { ColorValue, Text } from 'react-native';

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => <TabIcon emoji="🎥" color={color} />,
        }}
      />
      <Tabs.Screen
        name="clips"
        options={{
          title: 'My Clips',
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reel"
        options={{
          title: 'Reel',
          tabBarIcon: ({ color }) => <TabIcon emoji="🎬" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabIcon emoji="🗂️" color={color} />,
        }}
      />
    </Tabs>
  );
}
