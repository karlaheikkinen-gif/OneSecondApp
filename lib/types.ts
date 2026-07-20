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
}

export interface ClipGroup {
  dateKey: string;
  clips: Clip[];
}
