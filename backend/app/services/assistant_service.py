class AssistantService:
    async def chat(self, workspace_id: str, message: str, history: list):
        return {
            "reply": {
                "id": "msg-1",
                "role": "assistant",
                "content": f'Based on the workspace research, here is what I found regarding "{message}". The Vision Transformer (ViT) has shown promising results for fine-grained classification tasks.',
                "timestamp": "2024-01-01T00:00:00Z",
                "citations": ["Dosovitskiy et al., 2020"],
                "confidence": 0.92,
                "evidence_chain": [
                    {
                        "claim": "ViT achieves SOTA",
                        "supporting_papers": ["Dosovitskiy et al."],
                        "confidence": 0.95,
                    }
                ],
            }
        }

    async def summarize(self, paper_id: str):
        return {
            "summary": "This paper introduces a novel approach...",
            "paper_id": paper_id,
        }

    async def compare(self, paper_ids: list):
        return {
            "comparison": "Papers differ in architecture and approach.",
            "papers": paper_ids,
        }

    async def explain(self, concept_name: str, workspace_id: str):
        return {
            "concept": concept_name,
            "explanation": f"{concept_name} is a key concept in this field...",
        }

    async def get_history(self, workspace_id: str):
        return {"messages": []}
