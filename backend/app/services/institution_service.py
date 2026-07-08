class InstitutionService:
    async def list_institutions(self, search: str = None, limit: int = 20):
        return [
            {
                "_id": "inst-1",
                "name": "Stanford University",
                "country": "USA",
                "paper_count": 89,
            },
            {"_id": "inst-2", "name": "MIT", "country": "USA", "paper_count": 76},
        ]

    async def get_institution(self, institution_id: str):
        return {
            "_id": institution_id,
            "name": "Stanford University",
            "country": "USA",
            "paper_count": 89,
            "researcher_count": 45,
            "topics": ["Computer Vision", "AI"],
        }

    async def get_researchers(self, institution_id: str):
        return [
            {
                "name": "Dr. Alex Chen",
                "title": "Professor",
                "h_index": 45,
                "paper_count": 89,
            },
            {
                "name": "Dr. Sarah Wang",
                "title": "Research Scientist",
                "h_index": 32,
                "paper_count": 56,
            },
        ]
