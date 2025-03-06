import { type JSX } from 'react';
import { Modal } from './modal';
import { Avatar } from './avatar';
import './quest-details-modal.css';

interface QuestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  quest: {
    title: string;
    description: string;
    skills: Array<{
      name: string;
      xp: number;
    }>;
    assignedTo?: {
      id: string;
      displayName: string;
      avatarId: number;
    };
  };
}

export function QuestDetailsModal({ isOpen, onClose, quest, currentUserId }: QuestDetailsModalProps): JSX.Element {
  const isCurrentUser = quest.assignedTo?.id === currentUserId;

  const handleTurnIn = () => {
    // TODO: Implement turn in functionality
  };

  const handleAssignToMe = () => {
    // TODO: Implement assign to me functionality
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quest.title}>
      <div className="quest-details">
        <div className="quest-description">
          <h3>Description</h3>
          <p>{quest.description}</p>
        </div>

        <div className="quest-skills">
          <h3>Required Skills</h3>
          <div className="skills-list">
            {quest.skills.map((skill) => (
              <div key={skill.name} className="skill-item">
                <span className="skill-name">{skill.name}</span>
                <div className="skill-bar-container">
                  <div 
                    className="skill-bar" 
                    style={{ width: `${(skill.xp / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {quest.assignedTo ? (
          <div className="quest-assignee">
            <h3>Assigned To</h3>
            <div className="assignee-info">
              <Avatar 
                avatarId={quest.assignedTo.avatarId}
                size={32}
                className="w-8 h-8"
              />
              <span className="assignee-name">{quest.assignedTo.displayName}</span>
            </div>
            {isCurrentUser && (
              <div className="modal-actions">
                <button
                  onClick={handleTurnIn}
                  className="skill-button"
                >
                  Turn in Quest
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="quest-assignee">
            <div className="modal-actions">
              <button
                onClick={handleAssignToMe}
                className="skill-button"
              >
                Assign to Me
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 