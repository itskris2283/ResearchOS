class TimelineService:
    async def get_timeline(self, workspace_id: str):
        return {
            "_id": "tl-1",
            "workspace_id": workspace_id,
            "events": [
                {
                    "year": 2020,
                    "type": "paper",
                    "title": "An Image is Worth 16x16 Words",
                    "description": "Vision Transformer introduced",
                    "paper_id": "p1",
                },
                {
                    "year": 2021,
                    "type": "paper",
                    "title": "DeiT: Data-efficient Image Transformers",
                    "description": "Efficient ViT training",
                    "paper_id": "p2",
                },
                {
                    "year": 2021,
                    "type": "paper",
                    "title": "MAE: Masked Autoencoders",
                    "description": "Self-supervised learning for ViT",
                    "paper_id": "p3",
                },
                {
                    "year": 2022,
                    "type": "breakthrough",
                    "title": "DINOv2",
                    "description": "Self-supervised visual features",
                    "paper_id": "p4",
                },
                {
                    "year": 2023,
                    "type": "paper",
                    "title": "EVA-02",
                    "description": "SOTA vision encoder",
                    "paper_id": "p5",
                },
                {
                    "year": 2024,
                    "type": "paper",
                    "title": "ViT for Fine-Grained Pest Classification",
                    "description": "Agricultural AI application",
                    "paper_id": "p6",
                },
            ],
        }

    async def regenerate_timeline(self, workspace_id: str):
        return await self.get_timeline(workspace_id)

    async def get_timeline_animation(self, workspace_id: str):
        events = await self.get_timeline(workspace_id)
        return {"events": sorted(events["events"], key=lambda e: e["year"])}
