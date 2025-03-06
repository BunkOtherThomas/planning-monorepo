import { type CSSProperties } from 'react';

export interface AvatarSprite {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SPRITE_PADDING = -4;
const SPRITE_GRID = 4;
const SPRITE_SIZE = 136;

export const avatarSprites: AvatarSprite[] = Array.from({ length: 16 }, (_, index) => {
  const row = Math.floor(index / SPRITE_GRID);
  const col = index % SPRITE_GRID;
  
  return {
    id: index,
    x: col * (SPRITE_SIZE + SPRITE_PADDING),
    y: row * (SPRITE_SIZE + SPRITE_PADDING),
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  };
});

export function getAvatarById(id: number): AvatarSprite | undefined {
  return avatarSprites.find(sprite => sprite.id === id);
}

// Helper function to generate CSS for displaying a specific avatar
export function getAvatarStyle(id: number, elementSize?: number): CSSProperties {
  const sprite = getAvatarById(id);
  if (!sprite) return {};
  
  const scale = elementSize ? elementSize / SPRITE_SIZE : 1;
  const totalSize = SPRITE_GRID * SPRITE_SIZE;
  
  return {
    width: elementSize || sprite.width,
    height: elementSize || sprite.height,
    backgroundImage: `url('/images/avatars.jpeg')`,
    backgroundPosition: `-${sprite.x * scale}px -${sprite.y * scale}px`,
    backgroundSize: `${totalSize * scale}px ${totalSize * scale}px`,
    backgroundRepeat: 'no-repeat'
  };
} 