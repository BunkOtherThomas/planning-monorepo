import { useState } from 'react';
import { Avatar } from '../../components/Avatar';
import { avatarSprites } from '../../lib/avatarSprites';

interface AvatarSelectorProps {
  onSelect: (avatarId: number) => void;
  initialAvatarId?: number;
}

export function AvatarSelector({ onSelect, initialAvatarId = 0 }: AvatarSelectorProps) {
  const [currentAvatarId, setCurrentAvatarId] = useState(initialAvatarId);

  const handleAvatarChange = (event: React.MouseEvent, direction: number) => {
    event.preventDefault();
    let newId = (currentAvatarId + direction) % avatarSprites.length;
    if (newId < 0) {
      newId = avatarSprites.length - 1;
    }
    setCurrentAvatarId(newId);
    onSelect(newId);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', width: '220px', margin: '0 auto' }}>
      <button
        onClick={event => handleAvatarChange(event, -1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-brown-700 hover:text-accent-gold transition-colors"
        aria-label="Previous avatar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Avatar 
          avatarId={currentAvatarId} 
          size={140}
          className="border-2 border-accent-gold"
        />
      </div>

      <button
        onClick={event => handleAvatarChange(event, 1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-brown-700 hover:text-accent-gold transition-colors"
        aria-label="Next avatar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
} 