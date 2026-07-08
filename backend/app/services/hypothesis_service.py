class HypothesisService:
    async def test_hypothesis(self, hypothesis: str, workspace_id: str):
        return {
            "hypothesis": hypothesis,
            "supporting_evidence": [{"paper": "Paper A", "relevance": 0.92}],
            "contradicting_evidence": [],
            "novelty_score": 72,
            "suggested_experiments": [
                "Compare ViT vs CNN on pest dataset",
                "Test with different backbone architectures",
            ],
            "confidence": "Medium",
        }

    async def generate_proposal(self, topic: str, workspace_id: str):
        return {
            "title": f"Research Proposal: {topic}",
            "objective": "To investigate the application of...",
            "methodology": "We will use SOTA architectures...",
            "expected_outcomes": "Improved classification accuracy...",
            "datasets_suggested": ["PestBench", "IP102"],
            "baselines": ["ResNet-50", "ViT-B/16", "EfficientNet-B7"],
        }

    async def estimate_novelty(self, idea: str, workspace_id: str):
        return {
            "novelty_score": 65,
            "similar_work": ["Paper X (2023)", "Paper Y (2024)"],
            "potential_impact": "Medium",
            "explanation": "Similar ideas exist but with different applications",
        }
