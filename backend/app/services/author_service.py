from typing import Optional


class AuthorService:
    async def search_authors(
        self, query: Optional[str] = None, workspace_id: Optional[str] = None, limit: int = 1000, offset: int = 0
    ):
        return await self.list_authors(workspace_id=workspace_id, search=query, limit=limit, offset=offset)

    async def get_coauthor_network(self, author_id: str):
        return await self.get_author_coauthors(author_id)

    async def get_author_details(self, author_id: str):
        return await self.get_author(author_id)

    async def list_authors(
        self,
        workspace_id: str = None,
        search: str = None,
        limit: int = 1000,
        offset: int = 0,
    ):
        if not workspace_id:
            return []
            
        from app.models.paper import Paper
        papers = await Paper.find(Paper.workspace_id == workspace_id).to_list()
        
        author_stats = {}
        for paper in papers:
            for author in paper.authors:
                name = author.get("name")
                if not name:
                    continue
                if search and search.lower() not in name.lower():
                    continue
                    
                if name not in author_stats:
                    author_stats[name] = {
                        "_id": author.get("id") or name,
                        "name": name,
                        "institution": None,
                        "h_index": 0,
                        "citation_count": 0,
                        "paper_count": 0,
                        "topics": set(),
                        "citation_list": []
                    }
                
                stats = author_stats[name]
                stats["paper_count"] += 1
                paper_citations = paper.citation_count or 0
                stats["citation_count"] += paper_citations
                stats["citation_list"].append(paper_citations)
                for kw in (paper.keywords or []):
                    stats["topics"].add(kw)
                    
        # Convert to list and sort by paper_count
        result = list(author_stats.values())
        result.sort(key=lambda x: x["paper_count"], reverse=True)
        
        # Convert sets to list for JSON serialization and calculate h-index
        for r in result:
            r["topics"] = list(r["topics"])[:3] # Limit to top 3 topics
            
            citations = sorted(r["citation_list"], reverse=True)
            h = 0
            for i, c in enumerate(citations):
                if c >= i + 1:
                    h = i + 1
                else:
                    break
            r["h_index"] = h
            del r["citation_list"]
            
        return result[offset : offset + limit]

    async def get_author(self, author_id: str):
        return {
            "_id": author_id,
            "name": "Dr. Alex Chen",
            "institution": "Stanford University",
            "h_index": 45,
            "citation_count": 12800,
            "paper_count": 89,
            "topics": ["Vision Transformer"],
        }

    async def get_author_papers(self, author_id: str):
        return [
            {
                "_id": "paper-1",
                "title": "Vision Transformer for Pest Classification",
                "year": 2024,
            }
        ]

    async def get_author_coauthors(self, author_id: str):
        return [{"name": "Dr. Sarah Wang", "institution": "MIT", "paper_count": 12}]
