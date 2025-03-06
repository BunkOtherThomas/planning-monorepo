import { getAvatarStyle } from './avatar-sprites';

interface AvatarProps {
  avatarId: number;
  className?: string;
  size?: number;
}

export function Avatar({ avatarId, className = '', size }: AvatarProps) {
  const style = {
    ...getAvatarStyle(avatarId, size),
  };

  return (
    <div 
      className={`rounded-full overflow-hidden ${className}`}
      style={style}
    />
  );
} 