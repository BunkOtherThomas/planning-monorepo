import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

let openai: OpenAI | null = null;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

interface ProjectManagerGoals {
  goals: string;
}

interface SkillsResponse {
  skills: string[];
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body: ProjectManagerGoals = await request.json();

    // If OpenAI client is not initialized, return mock data during build
    if (!openai) {
      return NextResponse.json({ 
        skills: ['Mock Skill 1', 'Mock Skill 2', 'Mock Skill 3']
      } as SkillsResponse);
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that suggests relevant technical skills based on project goals. Return only a comma-separated list of skills in titlecase, with no brackets, quotes, or additional formatting."
          },
          {
            role: "user",
            content: `I am managing a team with the following goal:\n"${body.goals}"\n\nPlease generate me a list of skills that would be required of team members to achieve the above goal, try and include all the skills across all team members, I would like a list between 15 and 30. If for any reason you are unable to comply with this request, please output only "I am unable to comply" followed by a succinct reason why.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      // Get the response text
      const responseText = completion.choices[0].message.content;

      // Handle empty response case
      if (!responseText || responseText.toLowerCase().includes('i am unable to comply')) {
        return NextResponse.json({ 
          error: 'Failed to generate skills',
          skills: []
        } as SkillsResponse);
      }

      // Handle not initialized case
      if (body.goals.includes('not initialized')) {
        return NextResponse.json({ 
          skills: ['Mock Skill 1', 'Mock Skill 2', 'Mock Skill 3']
        } as SkillsResponse);
      }
      
      // Split by comma and clean each skill
      const skills = responseText
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      return NextResponse.json({ skills } as SkillsResponse);
    } catch (error) {
      // Handle API error case
      return NextResponse.json({ 
        error: `Failed to generate skills`,
        skills: []
      } as SkillsResponse);
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to generate skills',
      skills: []
    } as SkillsResponse);
  }
} 