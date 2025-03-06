import { type JSX } from 'react';
import { Modal } from './modal';
import { Avatar } from './avatar';
import './quest-details-modal.css';

interface QuestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: {
    title: string;
    description: string;
    skills: Array<{
      name: string;
      xp: number;
    }>;
    assignedTo?: {
      displayName: string;
      avatarId: number;
    };
  };
}

export function QuestDetailsModal({ isOpen, onClose, quest }: QuestDetailsModalProps): JSX.Element {
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

        {quest.assignedTo && (
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
          </div>
        )}
      </div>
    </Modal>
  );
} 