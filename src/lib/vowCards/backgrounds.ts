import type { BackgroundPreset } from "./types";

export const BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "garden",
    label: "Garden",
    src: "/vow-card-backgrounds/garden.jpg",
    gradient: "linear-gradient(135deg, #e8d5b7 0%, #f5e6d3 50%, #d4c4a8 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    src: "/vow-card-backgrounds/sunset.jpg",
    gradient: "linear-gradient(135deg, #f0c27f 0%, #fc5c7d 100%)",
  },
  {
    id: "floral",
    label: "Floral",
    src: "/vow-card-backgrounds/floral.jpg",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    src: "/vow-card-backgrounds/ocean.jpg",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "vineyard",
    label: "Vineyard",
    src: "/vow-card-backgrounds/vineyard.jpg",
    gradient: "linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    src: "/vow-card-backgrounds/forest.jpg",
    gradient: "linear-gradient(135deg, #2d5016 0%, #5a7247 50%, #8fbc8f 100%)",
  },
  {
    id: "mountain",
    label: "Mountain",
    src: "/vow-card-backgrounds/mountain.jpg",
    gradient: "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)",
  },
  {
    id: "lavender",
    label: "Lavender",
    src: "/vow-card-backgrounds/lavender.jpg",
    gradient: "linear-gradient(135deg, #c9b1ff 0%, #f0e6ff 100%)",
  },
  {
    id: "romantic",
    label: "Romantic",
    src: "/vow-card-backgrounds/romantic.jpg",
    gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  },
  {
    id: "classic",
    label: "Classic",
    src: "/vow-card-backgrounds/classic.jpg",
    gradient: "linear-gradient(135deg, #d4c4a8 0%, #e8d5b7 50%, #c2b280 100%)",
  },
];

export function getBackground(id: string): BackgroundPreset {
  return BACKGROUNDS.find((bg) => bg.id === id) || BACKGROUNDS[0];
}
