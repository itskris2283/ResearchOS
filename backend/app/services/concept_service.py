class ConceptService:
    async def list_concepts(self, search: str = None, limit: int = 20):
        return [
            {
                "_id": "con-1",
                "name": "Vision Transformer",
                "category": "Architecture",
                "description": "Transformer model applied to image patches",
            },
            {
                "_id": "con-2",
                "name": "Attention Mechanism",
                "category": "Method",
                "description": "Weighted focus on relevant features",
            },
        ]

    async def get_concept(self, concept_id: str):
        return {
            "_id": concept_id,
            "name": "Vision Transformer",
            "category": "Architecture",
            "description": "A transformer model for images",
            "papers": ["paper-1", "paper-2"],
            "related_concepts": ["Attention", "CNN"],
        }

    async def get_concept_evolution(self, concept_id: str):
        return [
            {"year": 2020, "event": "ViT introduced by Dosovitskiy et al."},
            {"year": 2021, "event": "DeiT: Data-efficient training"},
            {"year": 2022, "event": "MAE: Masked Autoencoders"},
        ]

    async def get_concept_papers(self, concept_id: str):
        return [
            {"_id": "p1", "title": "An Image is Worth 16x16 Words", "year": 2020},
            {
                "_id": "p2",
                "title": "Training data-efficient image transformers",
                "year": 2021,
            },
        ]

    async def get_family_tree(self, concept_id: str):
        return {
            "name": "Transformer",
            "children": [
                {"name": "ViT", "children": [{"name": "DeiT"}, {"name": "MAE"}]},
                {"name": "BERT", "children": [{"name": "RoBERTa"}, {"name": "ALBERT"}]},
            ],
        }
