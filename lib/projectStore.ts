import { File, Paths } from 'expo-file-system';

import { removeProjectFromAllClips } from './clipStore';
import { Project, ProjectType } from './types';

const projectsFile = new File(Paths.document, 'projects-index.json');

function readProjects(): Project[] {
  if (!projectsFile.exists) return [];
  try {
    return JSON.parse(projectsFile.textSync()) as Project[];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]): void {
  projectsFile.write(JSON.stringify(projects));
}

export function getAllProjects(): Project[] {
  return readProjects().sort((a, b) => a.createdAt - b.createdAt);
}

export function getProject(id: string): Project | undefined {
  return readProjects().find((p) => p.id === id);
}

export function createProject(name: string, color: string, type: ProjectType = 'standard'): Project {
  const projects = readProjects();
  const project: Project = {
    id: String(Date.now()),
    name,
    color,
    type,
    createdAt: Date.now(),
  };
  projects.push(project);
  writeProjects(projects);
  return project;
}

export function deleteProject(id: string): void {
  const projects = readProjects().filter((p) => p.id !== id);
  writeProjects(projects);
  removeProjectFromAllClips(id);
}
