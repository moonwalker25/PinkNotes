from groq import Groq

from config import GROQ_API_KEY, GROQ_MODEL


client = Groq(
    api_key=GROQ_API_KEY
)


def ask_groq(question: str) -> str:

    response = client.chat.completions.create(
        model=GROQ_MODEL,

        messages=[
            {
                "role": "system",
                "content": """
You are PinkNotes AI, an intelligent learning assistant.

Your job is to help students understand academic concepts.

Rules:
- Give clear and accurate answers.
- Explain concepts in a student-friendly way.
- Use examples when helpful.
- Structure long answers using headings and bullet points.
- Do not unnecessarily make answers extremely long.
"""
            },

            {
                "role": "user",
                "content": question
            }
        ],

        temperature=0.4,
        max_tokens=1500
    )

    return response.choices[0].message.content