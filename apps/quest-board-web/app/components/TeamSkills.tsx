import { FC } from 'react';
import styles from './Dashboard.module.css';
import { Team as TeamType, User } from '@quest-board/types';
import { getLevel } from '@planning/common-utils';

interface LocalTeam {
  id: string;
  inviteCode: string;
  members: User[];
  skills: string[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
}

interface TeamSkillsProps {
  team: LocalTeam | TeamType | null;
  user: User | null;
  error: string | null;
  onSkillClick: (skill: string) => void;
  onDeclineSkill: (skill: string) => void;
  isGuildLeader?: boolean;
}

const TeamSkills: FC<TeamSkillsProps> = ({
  team,
  user,
  error,
  onSkillClick,
  onDeclineSkill,
  isGuildLeader = false,
}) => {
  const getSkillName = (skillId: string) => skillId;

  const sortedSkills = team?.skills?.sort((a, b) => {
    if (!user?.skills) return 0;
    const aXP = user.skills[a] || 0;
    const bXP = user.skills[b] || 0;
    return bXP - aXP;
  }) || [];

  return (
    <>
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : team ? (
        <div className={styles.skillsList}>
          {sortedSkills.map((skill) => {
            const isNewSkill = user?.skills?.[skill] === -1;
            
            return (
              <div
                key={skill}
                className={`${styles.skillTag} relative flex justify-between items-center cursor-pointer ${
                  user?.skills?.[skill] === 0 && !user?.favoriteSkills?.includes(skill) ? 'opacity-10' : ''
                }`}
                onClick={() => !isNewSkill && onSkillClick(skill)}
              >
                <div className={`flex items-center font-lora text-text-light ${
                  user?.favoriteSkills?.includes(skill) ? 'text-amber-400' : ''
                }`}>
                  {getSkillName(skill)}
                </div>
                {isNewSkill ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeclineSkill(skill);
                      }}
                      className="flex items-center justify-center p-1 rounded-full hover:bg-red-500/10 text-red-500 transition-all hover:scale-110"
                      aria-label="Decline skill"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSkillClick(skill);
                      }}
                      className="flex items-center justify-center p-1 rounded-full hover:bg-green-500/10 text-green-500 transition-all hover:scale-110"
                      aria-label="Assess skill"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                ) : user?.skills?.[skill] !== undefined ? (
                  <span className="ml-2 font-lora text-text-light">
                    Lv. {getLevel(user.skills[skill] || 0).level}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.loading}>Loading skills...</div>
      )}
    </>
  );
};

export default TeamSkills; 