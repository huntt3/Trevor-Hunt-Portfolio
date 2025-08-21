export interface Project {
  title: string;
  description: string;
  toolsUsed: string[];
  link: string;
  image: string;
}

export interface ProjectData {
  [key: string]: Project[];
}
