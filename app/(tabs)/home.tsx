import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createProject, getAllProjects } from '../../lib/projectStore';
import { Project } from '../../lib/types';

const PROJECT_COLORS = [
  '#E63946',
  '#F4A261',
  '#E9C46A',
  '#2A9D8F',
  '#457B9D',
  '#6D597A',
  '#B5838D',
  '#3D5A80',
];

function ProjectTile({ project }: { project: Project }) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileColor, { backgroundColor: project.color }]} />
      <View style={styles.tileInfo}>
        <Text style={styles.tileName}>{project.name}</Text>
        {project.type === 'milestone' && <Text style={styles.tileBadge}>Milestone</Text>}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);

  const refresh = useCallback(() => {
    setProjects(getAllProjects());
  }, []);

  useFocusEffect(refresh);

  const openCreate = useCallback(() => {
    setNewName('');
    setNewColor(PROJECT_COLORS[0]);
    setIsCreating(true);
  }, []);

  const handleCreate = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createProject(trimmed, newColor);
    setIsCreating(false);
    refresh();
  }, [newName, newColor, refresh]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <View style={styles.headerIcons}>
          <Pressable
            style={styles.iconButton}
            onPress={() => Alert.alert('Search', 'Search across clips is coming soon.')}
          >
            <Text style={styles.iconText}>🔍</Text>
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => Alert.alert('Settings', 'Settings are coming soon.')}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {projects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No projects yet. Create one to start organizing your clips.</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProjectTile project={item} />}
        />
      )}

      <Pressable style={styles.newProjectButton} onPress={openCreate}>
        <Text style={styles.newProjectButtonText}>+ New Project</Text>
      </Pressable>

      <Modal visible={isCreating} animationType="slide" transparent onRequestClose={() => setIsCreating(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Project</Text>
            <TextInput
              style={styles.input}
              placeholder="Project name"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.colorRow}>
              {PROJECT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    color === newColor && styles.colorSwatchSelected,
                  ]}
                  onPress={() => setNewColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsCreating(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.createButton, !newName.trim() && styles.disabledButton]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text style={[styles.modalButtonText, styles.createButtonText]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  iconText: {
    fontSize: 20,
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
  list: {
    padding: 16,
    gap: 12,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    marginBottom: 12,
    gap: 12,
  },
  tileColor: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  tileInfo: {
    flex: 1,
  },
  tileName: {
    fontSize: 17,
    fontWeight: '600',
  },
  tileBadge: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  newProjectButton: {
    margin: 16,
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newProjectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#111',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  createButton: {
    backgroundColor: '#111',
  },
  disabledButton: {
    opacity: 0.4,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#fff',
  },
});
