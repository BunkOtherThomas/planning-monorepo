interface SkillIconProps {
  skill: string;
  size?: number;
}

export function SkillIcon({ skill, size = 24 }: SkillIconProps) {
  return (
    <div 
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-gray-100 rounded-full"
    >
      <span className="text-gray-600 font-medium">
        {skill.charAt(0).toUpperCase()}
      </span>
    </div>
  );
} 