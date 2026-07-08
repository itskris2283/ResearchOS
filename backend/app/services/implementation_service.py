class ImplementationService:
    async def search_implementations(self, paper_id: str = None, query: str = None):
        return [
            {
                "repo_name": "vit-pest-classification",
                "stars": 156,
                "forks": 34,
                "framework": "PyTorch",
                "license": "MIT",
                "last_updated": "2024-06-01",
                "url": "https://github.com/example/vit-pest",
                "description": "ViT for pest classification",
            }
        ]

    async def get_implementations(self, paper_id: str):
        return [
            {
                "repo_name": "vit-pest",
                "stars": 156,
                "framework": "PyTorch",
                "license": "MIT",
            },
            {
                "repo_name": "pest-benchmark",
                "stars": 89,
                "framework": "TensorFlow",
                "license": "Apache-2.0",
            },
        ]

    async def get_pretrained_models(self, paper_id: str):
        return [
            {
                "name": "vit-pest-base",
                "parameters": "86M",
                "size": "345MB",
                "license": "MIT",
                "framework": "PyTorch",
            },
            {
                "name": "vit-pest-large",
                "parameters": "307M",
                "size": "1.2GB",
                "license": "MIT",
                "framework": "PyTorch",
            },
        ]
