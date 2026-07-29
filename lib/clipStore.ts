import { Directory, File, Paths } from 'expo-file-system';

import { Clip, ClipGroup, ClipMediaType } from './types';

const clipsDir = new Directory(Paths.document, 'clips');
const indexFile = new File(Paths.document, 'clips-index.json');

function ensureClipsDir(): void {
  if (!clipsDir.exists) {
    clipsDir.create({ intermediates: true });
  }
}

export function dateKeyFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readIndex(): Clip[] {
  if (!indexFile.exists) return [];
  try {
    return JSON.parse(indexFile.textSync()) as Clip[];
  } catch {
    return [];
  }
}

function writeIndex(clips: Clip[]): void {
  indexFile.write(JSON.stringify(clips));
}

export function getAllClips(): Clip[] {
  return readIndex().sort((a, b) => b.createdAt - a.createdAt);
}

export function groupClipsByDate(clips: Clip[]): ClipGroup[] {
  const map = new Map<string, Clip[]>();
  for (const clip of clips) {
    const group = map.get(clip.dateKey);
    if (group) {
      group.push(clip);
    } else {
      map.set(clip.dateKey, [clip]);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, dateClips]) => ({
      dateKey,
      clips: dateClips.sort((a, b) => b.createdAt - a.createdAt),
    }));
}

export async function saveClip(
  sourceUri: string,
  recordedAt: Date = new Date(),
  mediaType: ClipMediaType = 'video'
): Promise<Clip> {
  ensureClipsDir();

  const extensionMatch = sourceUri.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1] : 'mov';
  const dateKey = dateKeyFor(recordedAt);
  const filename = `clip-${recordedAt.getTime()}.${extension}`;

  const sourceFile = new File(sourceUri);
  const destFile = new File(clipsDir, filename);
  await sourceFile.move(destFile);

  const clips = readIndex();
  const hasSelectedForDate = clips.some((c) => c.dateKey === dateKey && c.isSelected);

  const clip: Clip = {
    id: String(recordedAt.getTime()),
    filename,
    uri: destFile.uri,
    dateKey,
    createdAt: recordedAt.getTime(),
    isSelected: !hasSelectedForDate,
    mediaType,
    hashtags: [],
    projects: [],
    savedToCameraRoll: false,
  };

  clips.push(clip);
  writeIndex(clips);
  return clip;
}

export function selectClip(id: string): void {
  const clips = readIndex();
  const target = clips.find((c) => c.id === id);
  if (!target) return;

  for (const clip of clips) {
    if (clip.dateKey === target.dateKey) {
      clip.isSelected = clip.id === id;
    }
  }
  writeIndex(clips);
}

export function deleteClip(id: string): void {
  const clips = readIndex();
  const target = clips.find((c) => c.id === id);
  if (!target) return;

  try {
    const file = new File(target.uri);
    if (file.exists) file.delete();
  } catch {
    // File already gone; ignore.
  }

  const remaining = clips.filter((c) => c.id !== id);

  if (target.isSelected) {
    const sameDate = remaining.filter((c) => c.dateKey === target.dateKey);
    if (sameDate.length > 0) {
      const newest = sameDate.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
      newest.isSelected = true;
    }
  }

  writeIndex(remaining);
}

export function getSelectedClips(): Clip[] {
  return readIndex()
    .filter((c) => c.isSelected)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getClipsForProject(projectId: string): Clip[] {
  return readIndex()
    .filter((c) => c.projects.some((p) => p.projectId === projectId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Assigns a clip to a project. The first clip assigned to a project on a
 * given day is automatically included in that project's reel; later same-day
 * clips are added un-reeled, matching the Reel Logic spec.
 */
export function assignClipToProject(clipId: string, projectId: string): void {
  const clips = readIndex();
  const target = clips.find((c) => c.id === clipId);
  if (!target) return;
  if (target.projects.some((p) => p.projectId === projectId)) return;

  const isFirstForDay = !clips.some(
    (c) => c.dateKey === target.dateKey && c.projects.some((p) => p.projectId === projectId && p.isReel)
  );

  target.projects.push({ projectId, isReel: isFirstForDay, isHighlight: false });
  writeIndex(clips);
}

export function unassignClipFromProject(clipId: string, projectId: string): void {
  const clips = readIndex();
  const target = clips.find((c) => c.id === clipId);
  if (!target) return;

  target.projects = target.projects.filter((p) => p.projectId !== projectId);
  writeIndex(clips);
}

export function toggleClipReel(clipId: string, projectId: string): void {
  const clips = readIndex();
  const target = clips.find((c) => c.id === clipId);
  const assignment = target?.projects.find((p) => p.projectId === projectId);
  if (!assignment) return;

  assignment.isReel = !assignment.isReel;
  writeIndex(clips);
}

export function toggleClipHighlight(clipId: string, projectId: string): void {
  const clips = readIndex();
  const target = clips.find((c) => c.id === clipId);
  const assignment = target?.projects.find((p) => p.projectId === projectId);
  if (!assignment) return;

  assignment.isHighlight = !assignment.isHighlight;
  writeIndex(clips);
}

/** Strips a deleted project's assignment off every clip, without touching the clips themselves. */
export function removeProjectFromAllClips(projectId: string): void {
  const clips = readIndex();
  for (const clip of clips) {
    clip.projects = clip.projects.filter((p) => p.projectId !== projectId);
  }
  writeIndex(clips);
}
