import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ProjectManagerGoals, SkillsResponse } from '@quest-board/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body: ProjectManagerGoals = await request.json();

    if (body.skipGoals) {
      return NextResponse.json({ skills: [] });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates lists of skills required for project teams."
        },
        {
          role: "user",
          content: `I am managing a team with the following goal:\n"${body.goals}"\n\nPlease generate me an array of strings that makes a human readable (titlecase) list of skills that would be required of team members to achieve the above goal, try and include all the skills across all team members, I would like a list between 15 and 30. If for any reason you are unable to comply with this request, please output only "I am unable to comply" followed by a succinct reason why.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    if (response?.startsWith('I am unable to comply')) {
      return NextResponse.json({
        skills: [],
        error: response
      } as SkillsResponse);
    }

    // Parse the response into an array of skills
    const skills = response?.split('\n')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0)
      .map((skill: string) => skill.replace(/^\d+\.\s*/, '')); // Remove any numbering

    return NextResponse.json({ skills } as SkillsResponse);
  } catch (error) {
    console.error('Error generating skills:', error);
    return NextResponse.json(
      { error: 'Failed to generate skills', skills: [] } as SkillsResponse,
      { status: 500 }
    );
  }
} 