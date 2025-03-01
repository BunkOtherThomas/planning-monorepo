import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ProjectManagerGoals, SkillsResponse } from '@quest-board/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body: ProjectManagerGoals = await request.json();

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

    // if the response starts with I am unable to comply, return an error
    if (completion.choices[0].message.content?.startsWith('I am unable to comply')) {
      return NextResponse.json({ 
        error: 'Failed to generate skills',
        skills: []
      } as SkillsResponse);
    }

    // Get the response text
    const responseText = completion.choices[0].message.content || '';
    
    // Split by comma and clean each skill
    const skills = responseText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    return NextResponse.json({ skills } as SkillsResponse);
  } catch (error) {
    console.error('Error generating skills:', error);
    return NextResponse.json({ 
      error: 'Failed to generate skills',
      skills: []
    } as SkillsResponse);
  }
} 