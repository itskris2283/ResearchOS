from loguru import logger
from datetime import datetime
from typing import Optional
from app.utils.logger import setup_logger

logger = setup_logger()


class AssistantService:
    async def chat(self, workspace_id: str, message: str, history: list) -> dict:
        from app.config import settings
        from app.models.paper import Paper
        import httpx
        import json

        # Fetch top papers from workspace for context
        papers = await Paper.find(Paper.workspace_id == workspace_id).sort("-citation_count").limit(20).to_list()

        if not papers:
            return {
                "reply": {
                    "id": f"msg-{datetime.utcnow().timestamp()}",
                    "role": "assistant",
                    "content": "No papers found in this workspace yet. Run a discovery search first to populate it with research papers.",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "citations": [],
                    "confidence": 0.0,
                    "evidence_chain": [],
                }
            }

        # Build context from papers
        papers_context = ""
        for i, p in enumerate(papers):
            papers_context += f"[{i+1}] {p.title} ({p.year or 'N/A'})\n"
            if p.abstract:
                papers_context += f"    Abstract: {p.abstract[:400]}\n"
            papers_context += "\n"

        # Build conversation history
        history_context = ""
        for msg in history[-6:]:  # Last 6 messages for context
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_context += f"{role}: {msg.get('content', '')[:300]}\n"

        system_prompt = f"""You are an expert AI research assistant helping a researcher explore their workspace.
You have access to {len(papers)} papers from their research.

Guidelines:
- Answer based on the provided papers. Cite paper numbers [1], [2], etc. when making claims.
- Be specific and technical. Reference methods, results, and findings from the actual papers.
- If the question is outside the paper scope, say so and offer what you can answer from the papers.
- Keep responses concise but informative.
- Return ONLY valid JSON with these keys: content (string), citations (array of paper titles from the provided list that you referenced), confidence (0-1 float), evidence_chain (array of strings explaining your reasoning)."""

        try:
            # Use Groq API if configured
            import os
            groq_api_key = os.getenv("GROQ_API_KEY", "")
            if not groq_api_key:
                return self._generate_fallback_response(papers)
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_api_key}", "Content-Type": "application/json"},
                    json={
                        "model": "openai/gpt-oss-120b",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Papers:\n{papers_context}\n\nConversation history:\n{history_context}\n\nUser: {message}"},
                        ],
                        "temperature": 0.3,
                    },
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"].strip()

                # Parse JSON response
                if content.startswith("```json"):
                    content = content[7:-3]
                elif content.startswith("```"):
                    content = content[3:-3]

                result = json.loads(content)
                
                return {
                    "reply": {
                        "id": f"msg-{datetime.utcnow().timestamp()}",
                        "role": "assistant",
                        "content": result.get("content", "I couldn't generate a response."),
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "citations": result.get("citations", []),
                        "confidence": result.get("confidence", 0.7),
                        "evidence_chain": result.get("evidence_chain", []),
                    }
                }

        except Exception as e:
            logger.error(f"Assistant chat error: {e}")
            return self._fallback_response(message, papers)

    def _fallback_response(self, message: str, papers: list) -> dict:
        """Generate a helpful response from paper metadata when LLM is unavailable."""
        paper_titles = [p.title for p in papers[:5]]
        topics = []
        for p in papers:
            if p.keywords:
                topics.extend(p.keywords)
        top_topics = list(set(topics))[:5]

        return {
            "reply": {
                "id": f"msg-{datetime.utcnow().timestamp()}",
                "role": "assistant",
                "content": (
                    f"I found {len(papers)} papers in your workspace. "
                    f"Top topics: {', '.join(top_topics) if top_topics else 'various'}. "
                    f"Most cited papers: {'; '.join(paper_titles[:3])}. "
                    f"LLM temporarily unavailable. You can ask me to summarize specific papers or compare them."
                ),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "citations": paper_titles,
                "confidence": 0.5,
                "evidence_chain": [
                    {
                        "claim": f"Workspace contains {len(papers)} papers",
                        "supporting_papers": paper_titles,
                        "confidence": 1.0,
                    }
                ],
            }
        }

    async def summarize(self, paper_id: str) -> dict:
        from app.models.paper import Paper
        from bson import ObjectId
        
        paper = await Paper.get(ObjectId(paper_id)) if ObjectId.is_valid(paper_id) else await Paper.find_one(Paper.id == paper_id)
        
        if not paper:
            return {"summary": "Paper not found", "paper_id": paper_id}

        return {
            "summary": (
                f"Title: {paper.title}\n"
                f"Year: {paper.year}\n"
                f"Venue: {paper.venue}\n"
                f"Citations: {paper.citation_count}\n"
                f"Authors: {', '.join(a.get('name', '') for a in paper.authors[:3])}\n\n"
                f"Abstract: {paper.abstract or 'No abstract available'}"
            ),
            "paper_id": paper_id,
        }

    async def compare(self, paper_ids: list) -> dict:
        from app.models.paper import Paper
        from bson import ObjectId

        papers = []
        for pid in paper_ids:
            p = await Paper.get(ObjectId(pid)) if ObjectId.is_valid(pid) else await Paper.find_one(Paper.id == pid)
            if p:
                papers.append(p)

        if len(papers) < 2:
            return {"comparison": "Need at least 2 valid papers to compare", "papers": paper_ids}

        comparison = "Comparison:\n\n"
        for i, p in enumerate(papers):
            comparison += f"{i+1}. {p.title} ({p.year})\n"
            comparison += f"   Venue: {p.venue}\n"
            comparison += f"   Citations: {p.citation_count}\n"
            comparison += f"   Keywords: {', '.join(p.keywords[:5]) if p.keywords else 'N/A'}\n\n"

        return {
            "comparison": comparison,
            "papers": paper_ids,
        }

    async def explain(self, concept_name: str, workspace_id: str) -> dict:
        from app.models.paper import Paper

        papers = await Paper.find(Paper.workspace_id == workspace_id).limit(30).to_list()
        
        # Find papers mentioning this concept
        relevant = []
        for p in papers:
            text = f"{p.title} {p.abstract or ''} {' '.join(p.keywords or [])}".lower()
            if concept_name.lower() in text:
                relevant.append(p)

        if not relevant:
            return {
                "concept": concept_name,
                "explanation": f"No papers in this workspace mention '{concept_name}'. Try a broader term or run a new discovery search."
            }

        explanation = f"'{concept_name}' appears in {len(relevant)} papers in your workspace:\n\n"
        for p in relevant[:5]:
            explanation += f"• {p.title} ({p.year})\n"

        return {
            "concept": concept_name,
            "explanation": explanation,
        }

    async def get_history(self, workspace_id: str):
        return {"messages": []}