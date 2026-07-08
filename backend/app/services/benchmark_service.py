class BenchmarkService:
    async def list_benchmarks(self):
        return [
            {
                "_id": "bm-1",
                "name": "PestBench Leaderboard",
                "task": "Fine-Grained Classification",
            }
        ]

    async def get_benchmark(self, benchmark_id: str):
        return {
            "_id": benchmark_id,
            "name": "PestBench",
            "task": "Fine-Grained Pest Classification",
            "metrics": ["Accuracy", "F1", "Precision"],
        }

    async def get_leaderboard(self, benchmark_id: str):
        return [
            {"model": "ViT-L/16", "accuracy": 96.5, "params": "307M", "year": 2024},
            {
                "model": "EfficientNet-B7",
                "accuracy": 94.2,
                "params": "66M",
                "year": 2023,
            },
        ]
