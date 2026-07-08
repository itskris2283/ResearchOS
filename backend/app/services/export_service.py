class ExportService:
    async def export_workspace(self, workspace_id: str, format: str = "markdown"):
        return {
            "content": "# Workspace Export\n\nThis is the exported workspace content.",
            "format": format,
            "filename": f"workspace_{workspace_id}.{format}",
        }

    async def export_review(self, workspace_id: str, format: str = "markdown"):
        return {
            "content": "# Literature Review\n\nGenerated review content with citations.",
            "format": format,
            "filename": f"literature_review_{workspace_id}.{format}",
        }

    async def export_graph(self, workspace_id: str, format: str = "png"):
        return {
            "graph_data": {"nodes": [], "edges": []},
            "format": format,
            "filename": f"graph_{workspace_id}.{format}",
        }
