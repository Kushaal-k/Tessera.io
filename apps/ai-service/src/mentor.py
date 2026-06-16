from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/mentor", tags=["Mentor"])


class MentorRequest(BaseModel):
    code_snippet: str
    language: str


class MentorResponse(BaseModel):
    guiding_questions: list[str]
    hint: str


@router.post("/ask", response_model=MentorResponse)
async def ask_mentor(req: MentorRequest) -> MentorResponse:
    # TODO: Connect to an LLM provider (e.g. OpenAI/Anthropic) using MCP or direct API
    # For now, we return mock Socratic questions based on Phase 2 prototype requirements.

    # Very basic naive logic for demonstration
    questions = [
        f"What is the primary goal of this {req.language} snippet?",
        "Are there any edge cases or unexpected inputs we might be missing?",
        "How does this block fit into the broader architecture of the file?",
    ]

    if "for" in req.code_snippet or "while" in req.code_snippet:
        questions.append(
            "Could this loop cause performance issues with large datasets?"
        )

    if "any" in req.code_snippet or "unknown" in req.code_snippet:
        questions.append(
            "Is there a more specific type we could use here instead of any/unknown?"
        )

    return MentorResponse(
        guiding_questions=questions,
        hint="Consider breaking this down into smaller, testable functions.",
    )
