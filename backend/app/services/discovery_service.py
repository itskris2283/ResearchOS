import asyncio
from loguru import logger
from typing import Optional
from app.repositories.workspace_repository import WorkspaceRepository
from app.utils.logger import setup_logger

logger = setup_logger()


class DiscoveryService:
    def __init__(self):
        self.workspace_repo = WorkspaceRepository()

    async def expand_query(self, query: str) -> list[str]:
        terms = query.strip().split()
        expanded = set(terms)
        for term in terms:
            if len(term) > 3:
                expanded.add(f"{term}s")
                expanded.add(f"{term}ing")
                expanded.add(f"{term}es")
            expanded.add(term.lower())
            expanded.add(term.upper())
        logger.info(f"Expanded query '{query}' to {len(expanded)} terms")
        return list(expanded)

    async def merge_results(self, results: list) -> list:
        seen = set()
        merged = []
        for result_list in results:
            for paper in result_list:
                paper_id = paper.get("doi") or paper.get("title", "")
                if paper_id and paper_id not in seen:
                    seen.add(paper_id)
                    merged.append(paper)
        logger.info(f"Merged {len(results)} sources into {len(merged)} unique papers")
        return merged

    async def log_progress(self, workspace_id: Optional[str], stage: str, progress: int):
        logger.info(
            f"Discovery pipeline [{workspace_id}] stage={stage} progress={progress}%"
        )
        if workspace_id and len(str(workspace_id)) == 24:
            try:
                await self.workspace_repo.update_workspace(
                    workspace_id,
                    {"status": f"{stage}:{progress}"},
                )
            except Exception as e:
                logger.warning(f"Failed to log progress: {e}")

    async def discover_topic(self, topic: str, workspace_id: Optional[str] = None) -> dict:
        is_valid_ws = bool(workspace_id and len(str(workspace_id)) == 24)
        logger.info(f"Starting discovery for topic='{topic}' workspace={workspace_id}")
        await self.log_progress(workspace_id, "query_expansion", 5)

        expanded_queries = await self.expand_query(topic)
        await self.log_progress(workspace_id, "search", 15)

        from app.services.paper_service import PaperService
        from app.repositories.paper_repository import PaperRepository

        paper_service = PaperService()
        paper_repo = PaperRepository()
        queries_to_search = expanded_queries[:2] if not is_valid_ws else expanded_queries[:4]
        tasks = [paper_service.search_all_sources(q) for q in queries_to_search]
        all_results = await asyncio.gather(*tasks, return_exceptions=True)
        # Filter out any failed tasks
        valid_results = [r for r in all_results if isinstance(r, list)]
        await self.log_progress(workspace_id, "dedup", 40)

        merged = await self.merge_results(valid_results)
        deduped = await paper_service.deduplicate(merged)
        await self.log_progress(workspace_id, "ranking", 55)

        from app.services.ranking_service import RankingService

        ranking_service = RankingService()
        ranked = await ranking_service.rank_papers(deduped, topic)
        if is_valid_ws:
            await self.log_progress(workspace_id, "embedding", 70)
            from app.services.embedding_service import EmbeddingService
            embedding_service = EmbeddingService()
            for paper in ranked[:50]:
                try:
                    await embedding_service.generate_paper_embeddings(paper)
                except Exception:
                    pass
            await self.log_progress(workspace_id, "graph", 85)

        # Ensure workspace_id and title are set before saving
        sanitized_ranked = []
        
        # Simple extraction heuristics for datasets and methods
        common_datasets = ["ImageNet", "COCO", "VQA", "CIFAR-10", "MNIST", "SQuAD", "GLUE", "Kitti", "Cityscapes", "Waymo"]
        common_methods = ["Transformer", "CNN", "RNN", "LSTM", "GAN", "Diffusion", "Reinforcement Learning", "SVM", "Random Forest", "ViT", "LoRA", "ResNet"]
        
        for p in ranked:
            p["workspace_id"] = workspace_id or ""
            
            title = p.get("title") or "Unknown Title"
            abstract = p.get("abstract") or ""
            p["title"] = title
                
            text_to_search = (title + " " + abstract).lower()
            
            if not p.get("datasets"):
                p["datasets"] = [ds for ds in common_datasets if ds.lower() in text_to_search]
            if not p.get("methods"):
                p["methods"] = [m for m in common_methods if m.lower() in text_to_search]
                
            sanitized_ranked.append(p)
            
        if is_valid_ws:
            from app.models.paper import Paper
            await Paper.find(Paper.workspace_id == workspace_id).delete()
            await paper_repo.bulk_create(sanitized_ranked)
            logger.info(f"Saved {len(sanitized_ranked)} papers for workspace {workspace_id}")

        knowledge_graph = None
        if is_valid_ws:
            from app.services.graph_service import GraphService

            graph_service = GraphService()
            knowledge_graph = await graph_service.build_knowledge_graph(
                papers=ranked,
                authors=[],
                datasets=[],
                methods=[],
            )
            citation_graph = await graph_service.build_citation_graph(ranked)
            concept_graph = await graph_service.build_concept_graph(concepts=[], papers=ranked)
            author_graph = await graph_service.build_author_graph(authors=[])
            dataset_graph = await graph_service.build_dataset_graph(datasets=[], papers=ranked)
            topic_graph = await graph_service.build_topic_graph(topics=[], papers=ranked)
            
            await graph_service.cache_graph(workspace_id, "knowledge", knowledge_graph)
            await graph_service.cache_graph(workspace_id, "citation", citation_graph)
            await graph_service.cache_graph(workspace_id, "concept", concept_graph)
            await graph_service.cache_graph(workspace_id, "author", author_graph)
            await graph_service.cache_graph(workspace_id, "dataset", dataset_graph)
            await graph_service.cache_graph(workspace_id, "topic", topic_graph)

            await self.log_progress(workspace_id, "complete", 100)
            
            # Calculate statistics
            unique_authors = set()
            citations = 0
            for p in ranked:
                citations += p.get("citation_count", 0)
                for author in p.get("authors", []):
                    author_name = author.get("name") if isinstance(author, dict) else author
                    if author_name:
                        unique_authors.add(author_name)
                        
            stats = {
                "papers": len(ranked),
                "authors": len(unique_authors),
                "datasets": 0,
                "methods": 0,
                "citations": citations
            }
            
            await self.workspace_repo.update_workspace(
                workspace_id,
                {
                    "status": "ready",
                    "statistics": stats
                },
            )

        return {
            "topic": topic,
            "papers": ranked,
            "total_papers": len(ranked),
            "knowledge_graph": knowledge_graph,
            "status": "completed",
        }
