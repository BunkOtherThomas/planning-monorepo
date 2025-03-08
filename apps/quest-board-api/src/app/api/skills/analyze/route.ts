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

interface TaskAnalysisRequest {
  title: string;
  description?: string;
  skills: string[];
}

interface SkillProficiency {
  skill: string;
  proficiency: number; // 0-3
}

interface TaskAnalysisResponse {
  skillProficiencies: SkillProficiency[];
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body: TaskAnalysisRequest = await request.json();

    // If OpenAI client is not initialized, return mock data during build
    if (!openai) {
      return NextResponse.json({ 
        skillProficiencies: [
          { skill: "Mock Skill", proficiency: 1 }
        ]
      } as TaskAnalysisResponse);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes tasks and determines required skill proficiencies. For each skill, assign a number from 0-3 where:\n0 = Not required\n1 = Basic understanding needed\n2 = Proficient level required\n3 = Expert level required\n\nIMPORTANT: You must always return at least one skill with proficiency level 1 or higher. If no skills seem directly relevant, use your best judgment to identify the most closely related skill and assign it a proficiency level of 1 or higher.\n\nReturn the response as a JSON array of objects with 'skill' and 'proficiency' properties."
        },
        {
          role: "user",
          content: `Analyze this task and determine the required proficiency level for each skill:\n\nTitle: ${body.title}\n${body.description ? `Description: ${body.description}\n` : ''}\nAvailable skills: ${body.skills.join(', ')}\n\nFor each skill, determine how proficient someone needs to be to complete this task.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content || '';
    
    try {
      const skillProficiencies = JSON.parse(responseText) as SkillProficiency[];
      
      // Validate the response format
      if (!Array.isArray(skillProficiencies)) {
        return NextResponse.json({ 
          error: 'Failed to analyze skills',
          skillProficiencies: []
        } as TaskAnalysisResponse, { status: 500 });
      }

      // Validate each proficiency is between 0-3
      for (const sp of skillProficiencies) {
        if (typeof sp.proficiency !== 'number' || sp.proficiency < 0 || sp.proficiency > 3) {
          return NextResponse.json({ 
            error: 'Failed to analyze skills',
            skillProficiencies: []
          } as TaskAnalysisResponse, { status: 500 });
        }
      }

      return NextResponse.json({ skillProficiencies } as TaskAnalysisResponse);
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return NextResponse.json({ 
        error: 'Failed to analyze skills',
        skillProficiencies: []
      } as TaskAnalysisResponse, { status: 500 });
    }
  } catch (error) {
    console.error('Error analyzing skills:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze skills',
      skillProficiencies: []
    } as TaskAnalysisResponse, { status: 500 });
  }
} 