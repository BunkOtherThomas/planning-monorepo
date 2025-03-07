import { getAvatarStyle } from '../lib/avatarSprites';

interface AvatarProps {
  avatarId: number;
  className?: string;
  size?: number;
  spritesheet?: string;
}

export function Avatar({ avatarId, className = '', size, spritesheet }: AvatarProps) {
  const style = {
    ...getAvatarStyle(avatarId, size, spritesheet),
  };

  return (
    <div 
      className={`rounded-full overflow-hidden ${className}`}
      style={style}
    />
  );
} 