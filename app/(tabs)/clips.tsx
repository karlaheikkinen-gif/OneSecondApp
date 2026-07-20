import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { deleteClip, getAllClips, groupClipsByDate, selectClip } from '../../lib/clipStore';
import { Clip, ClipGroup } from '../../lib/types';

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateKey === formatDateKeyFromDate(today)) return 'Today';
  if (dateKey === formatDateKeyFromDate(yesterday)) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

function formatDateKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function ClipThumb({ clip }: { clip: Clip }) {
  const player = useVideoPlayer(clip.uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView style={styles.thumb} player={player} contentFit="cover" nativeControls={false} />;
}

function ClipRow({ clip, onToggleSelect, onDelete }: {
  clip: Clip;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      <ClipThumb clip={clip} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTime}>{formatTime(clip.createdAt)}</Text>
        {clip.isSelected && <Text style={styles.selectedBadge}>Kept for this day</Text>}
      </View>
      <View style={styles.rowActions}>
        {!clip.isSelected && (
          <Pressable style={styles.actionButton} onPress={() => onToggleSelect(clip.id)}>
            <Text style={styles.actionText}>Keep</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() =>
            Alert.alert('Delete clip?', 'This clip will be permanently removed.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(clip.id) },
            ])
          }
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ClipsScreen() {
  const [groups, setGroups] = useState<ClipGroup[]>([]);

  const refresh = useCallback(() => {
    setGroups(groupClipsByDate(getAllClips()));
  }, []);

  useFocusEffect(refresh);

  const handleToggleSelect = useCallback(
    (id: string) => {
      selectClip(id);
      refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteClip(id);
      refresh();
    },
    [refresh]
  );

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No clips yet. Record your first one-second clip!</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={groups}
      keyExtractor={(g) => g.dateKey}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{formatDateLabel(item.dateKey)}</Text>
          {item.clips.map((clip) => (
            <ClipRow key={clip.id} clip={clip} onToggleSelect={handleToggleSelect} onDelete={handleDelete} />
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  section: {
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  rowInfo: {
    flex: 1,
  },
  rowTime: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedBadge: {
    fontSize: 12,
    color: '#2a8f4a',
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#fdeaea',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  deleteText: {
    color: '#c33',
  },
});
