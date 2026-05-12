import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "You are CollegeMatch-AI counselor for Indian students. Help with college selection, JEE cutoffs, IIT NIT IIIT admissions, state exams TNEA KEAM WBJEE. Be concise, under 100 words." 
                    },
                    ...messages
                ],
                temperature: 0.5,
                max_tokens: 200
            })
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
