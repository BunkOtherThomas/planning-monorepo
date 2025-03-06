'use client';

import { useState } from 'react';
import { Modal } from '@repo/ui/modal';

interface SkillAssessmentFormProps {
  skillName: string;
  onSubmit: (values: SkillAssessmentValues) => void;
  onClose: () => void;
}

interface SkillAssessmentValues {
  professionalExperience: number;
  formalEducation: number;
  informalExperience: number;
  confidence: number;
}

export function SkillAssessmentModal({ skillName, onSubmit, onClose }: SkillAssessmentFormProps) {
  const [values, setValues] = useState<SkillAssessmentValues>({
    professionalExperience: 0,
    formalEducation: 0,
    informalExperience: 0,
    confidence: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    onClose();
  };

  const handleSliderChange = (field: keyof SkillAssessmentValues, value: string) => {
    setValues(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Assess Your ${skillName} Skills`}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="relative flex flex-col h-full">
            <div className="flex-none">
              <label className="block text-sm font-medium text-text-light mb-2">
                Professional Experience
                <br/><small className="text-text-muted">How much you have used <span className="text-accent-gold">{skillName}</span> in a professional capacity</small>
              </label>
            </div>
            <div className="flex-grow flex flex-col justify-end">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={values.professionalExperience}
                onChange={(e) => handleSliderChange('professionalExperience', e.target.value)}
                className="w-full h-2 bg-primary-darker rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>None</span>
                <span>Extensive</span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col h-full">
            <div className="flex-none">
              <label className="block text-sm font-medium text-text-light mb-2">
                Formal Education
                <br/><small className="text-text-muted">How much formal education you have had relevant to <span className="text-accent-gold">{skillName}</span> (e.g. University or College)</small>
              </label>
            </div>
            <div className="flex-grow flex flex-col justify-end">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={values.formalEducation}
                onChange={(e) => handleSliderChange('formalEducation', e.target.value)}
                className="w-full h-2 bg-primary-darker rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>None</span>
                <span>Extensive</span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col h-full">
            <div className="flex-none">
              <label className="block text-sm font-medium text-text-light mb-2">
                Informal Experience
                <br/><small className="text-text-muted">How much informal experience you have had relevant to <span className="text-accent-gold">{skillName}</span> (e.g. certifications, workshops, or personal projects)</small>
              </label>
            </div>
            <div className="flex-grow flex flex-col justify-end">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={values.informalExperience}
                onChange={(e) => handleSliderChange('informalExperience', e.target.value)}
                className="w-full h-2 bg-primary-darker rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>None</span>
                <span>Extensive</span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col h-full">
            <div className="flex-none">
              <label className="block text-sm font-medium text-text-light mb-2">
                Confidence
                <br/><small className="text-text-muted">How comfortable and confident you feel using <span className="text-accent-gold">{skillName}</span> in real-world situations</small>
              </label>
            </div>
            <div className="flex-grow flex flex-col justify-end">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={values.confidence}
                onChange={(e) => handleSliderChange('confidence', e.target.value)}
                className="w-full h-2 bg-primary-darker rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-light bg-primary-darker border border-accent-brown rounded-md hover:bg-primary-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-accent-gold rounded-md hover:bg-accent-gold/90 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
} 