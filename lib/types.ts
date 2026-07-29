export type ClipMediaType = 'photo' | 'video';

export interface ProjectAssignment {
  projectId: string;
  /** Included in that project's auto-compilation. */
  isReel: boolean;
  /** Included in that project's shorter highlight-only compilation. */
  isHighlight: boolean;
}

export interface Clip {
  id: string;
  filename: string;
  uri: string;
  /** Local calendar date the clip was recorded, formatted YYYY-MM-DD. */
  dateKey: string;
  /** Epoch milliseconds. */
  createdAt: number;
  /** Whether this is the one clip kept for its dateKey. Only one clip per date can be selected. */
  isSelected: boolean;
  mediaType: ClipMediaType;
  hashtags: string[];
  /** Which project(s) this clip belongs to, and its reel/highlight status within each. */
  projects: ProjectAssignment[];
  savedToCameraRoll: boolean;
}

export interface ClipGroup {
  dateKey: string;
  clips: Clip[];
}

export type ProjectType = 'standard' | 'milestone';

export interface Project {
  id: string;
  name: string;
  /** Hex color, e.g. '#FF6B6B'. */
  color: string;
  type: ProjectType;
  createdAt: number;
}
