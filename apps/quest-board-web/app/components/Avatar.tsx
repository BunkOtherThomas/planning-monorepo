import { getAvatarStyle } from '../../lib/avatarSprites';

interface AvatarProps {
  avatarId: number;
  className?: string;
  size?: number; // Optional size override
}

export function Avatar({ avatarId, className = '', size }: AvatarProps) {
  const style = {
    ...getAvatarStyle(avatarId),
    ...(size ? { width: size, height: size } : {}),
  };

  return (
    <div 
      className={`rounded-full overflow-hidden ${className}`}
      style={style}
    />
  );
} 