class AnalyticsService:
    async def get_analytics(self, workspace_id: str):
        return await self.get_workspace_analytics(workspace_id)

    async def get_trends(self, workspace_id: str):
        return await self.get_research_trends(workspace_id)

    async def get_workspace_analytics(self, workspace_id: str):
        return {
            "total_papers": 1247,
            "total_authors": 892,
            "total_citations": 12800,
            "average_citations": 10.3,
            "publication_trend": [
                {"year": y, "count": (y - 2019) * 20 + 15} for y in range(2020, 2025)
            ],
        }

    async def get_research_trends(self, workspace_id: str):
        return {
            "trending_topics": ["Vision Transformer", "Multimodal", "Few-Shot"],
            "velocity": 0.82,
        }

    async def get_distributions(self, workspace_id: str):
        return {
            "venues": [{"name": "CVPR", "count": 89}],
            "years": [{"year": 2024, "count": 45}],
        }
