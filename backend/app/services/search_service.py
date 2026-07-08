class SearchService:
    async def global_search(self, q: str, type: str = None, limit: int = 20):
        results = []
        if not type or type == "papers":
            results.append(
                {
                    "type": "paper",
                    "title": f"Vision Transformer for {q}",
                    "id": "p1",
                    "year": 2024,
                    "venue": "CVPR",
                }
            )
        if not type or type == "authors":
            results.append(
                {
                    "type": "author",
                    "name": f"Researcher in {q}",
                    "id": "a1",
                    "institution": "Stanford",
                }
            )
        if not type or type == "datasets":
            results.append(
                {
                    "type": "dataset",
                    "name": f"{q} Dataset",
                    "id": "d1",
                    "size": "100K images",
                }
            )
        return {"results": results, "total": len(results)}

    async def get_suggestions(self, q: str):
        return {
            "suggestions": [
                f"{q} classification",
                f"{q} detection",
                f"{q} benchmark",
                f"{q} survey",
                f"{q} transformer",
            ]
        }

    async def get_history(self):
        return {
            "history": [
                "Vision Transformer",
                "Fine-Grained Classification",
                "Pest Classification",
                "Agricultural AI",
            ]
        }
