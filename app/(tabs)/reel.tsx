import { useEventListener } from 'expo';
import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getSelectedClips } from '../../lib/clipStore';
import { Clip } from '../../lib/types';

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReelScreen() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const indexRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      setClips(getSelectedClips());
    }, [])
  );

  const current = clips[index];
  const player = useVideoPlayer(current?.uri ?? null, (p) => {
    p.loop = false;
  });

  useEventListener(player, 'playToEnd', () => {
    const next = indexRef.current + 1;
    if (next < clips.length) {
      indexRef.current = next;
      setIndex(next);
    } else {
      setIsPlaying(false);
    }
  });

  const handlePlayFromStart = useCallback(() => {
    indexRef.current = 0;
    setIndex(0);
    setIsPlaying(true);
  }, []);

  // Each clip advance creates a new player instance (see useVideoPlayer above);
  // resume playback on it whenever a reel playthrough is active.
  useEffect(() => {
    if (isPlaying) {
      player.play();
    }
  }, [isPlaying, player]);

  if (clips.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No kept clips yet. Record a clip and tap "Keep this one" to start building your reel.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView style={styles.player} player={player} contentFit="cover" nativeControls={false} />
      <View style={styles.overlay}>
        <Text style={styles.counter}>
          {index + 1} / {clips.length}
        </Text>
        {current && <Text style={styles.dateLabel}>{formatDateLabel(current.dateKey)}</Text>}
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handlePlayFromStart}>
          <Text style={styles.buttonText}>{isPlaying ? 'Restart Reel' : 'Play Reel'}</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>
        This plays your kept clips back-to-back. Exporting them as a single shareable video file is
        coming in a future update.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  player: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateLabel: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    color: '#aaa',
    fontSize: 11,
    textAlign: 'center',
  },
});
