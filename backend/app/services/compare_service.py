class CompareService:
    async def compare_papers(self, paper_ids: list):
        return {
            "papers": paper_ids,
            "comparison": {
                "architecture": "Different",
                "performance": "Similar",
                "datasets": "Same",
            },
            "details": [
                {"paper_id": pid, "metrics": {"accuracy": 94.5}} for pid in paper_ids
            ],
        }

    async def compare_methods(self, method_ids: list):
        return {
            "methods": method_ids,
            "comparison": "Methods differ in complexity and performance",
        }

    async def compare_datasets(self, dataset_ids: list):
        return {
            "datasets": dataset_ids,
            "comparison": "Datasets differ in size and class distribution",
        }
