import networkx as nx
from loguru import logger
from typing import Optional
from datetime import datetime
from app.models.graph_cache import GraphCache
from app.utils.logger import setup_logger

logger = setup_logger()


class GraphService:
    async def _graph_to_dict(self, graph: nx.Graph) -> dict:
        nodes = []
        for node, attrs in graph.nodes(data=True):
            nodes.append({"id": node, **attrs})
        edges = []
        for u, v, attrs in graph.edges(data=True):
            edges.append({"source": u, "target": v, **attrs})
        return {
            "nodes": nodes,
            "edges": edges,
            "node_count": len(nodes),
            "edge_count": len(edges),
        }

    async def build_citation_graph(self, papers: list) -> dict:
        graph = nx.DiGraph()
        for paper in papers:
            pid = paper.get("id") or paper.get("doi") or paper.get("title", "unknown")
            graph.add_node(pid, title=paper.get("title", ""), year=paper.get("year"))
            for ref in paper.get("references", []):
                graph.add_edge(pid, ref, type="cites")
            for cit in paper.get("citations", []):
                graph.add_edge(cit, pid, type="cited_by")
        logger.info(
            f"Built citation graph with {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges"
        )
        return await self._graph_to_dict(graph)

    async def build_concept_graph(self, concepts: list, papers: list) -> dict:
        graph = nx.Graph()
        for concept in concepts:
            name = concept.get("name", "unknown")
            graph.add_node(
                name, type="concept", description=concept.get("description", "")
            )
        for paper in papers:
            pid = paper.get("id") or paper.get("doi") or paper.get("title", "unknown")
            
            # Format authors safely
            authors = paper.get("authors") or []
            author_names = [a.get("name", "") if isinstance(a, dict) else str(a) for a in authors]
            author_str = ", ".join(filter(None, author_names[:3]))
            if len(author_names) > 3:
                author_str += " et al."
                
            # Truncate abstract safely
            abstract = paper.get("abstract") or ""
            abstract_short = abstract[:150] + "..." if len(abstract) > 150 else abstract
            
            graph.add_node(pid, 
                           type="paper", 
                           title=paper.get("title", ""),
                           year=paper.get("year", "N/A"),
                           authors=author_str,
                           abstract=abstract_short)
            
            keywords = paper.get("keywords") or []
            if not keywords:
                keywords = (paper.get("methods") or []) + (paper.get("datasets") or [])
                
            for kw in keywords:
                if not graph.has_node(kw):
                    graph.add_node(kw, type="concept", description="")
                graph.add_edge(pid, kw, relation="discusses")
                
        result = await self._graph_to_dict(graph)
        logger.info(
            f"Built concept graph: {result['node_count']} nodes, {result['edge_count']} edges"
        )
        return result

    async def build_knowledge_graph(
        self, papers: list, authors: list, datasets: list, methods: list
    ) -> dict:
        graph = nx.Graph()
        for paper in papers:
            pid = paper.get("id") or paper.get("doi") or paper.get("title", "unknown")
            graph.add_node(
                pid, type="paper", title=paper.get("title", ""), year=paper.get("year")
            )
            for author in paper.get("authors", []):
                aid = author.get("id") or author.get("name", "unknown")
                graph.add_node(aid, type="author", name=author.get("name", ""))
                graph.add_edge(pid, aid, relation="authored")
            for ds in paper.get("datasets", []):
                graph.add_node(ds, type="dataset")
                graph.add_edge(pid, ds, relation="uses_dataset")
            for method in paper.get("methods", []):
                graph.add_node(method, type="method")
                graph.add_edge(pid, method, relation="uses_method")
        result = await self._graph_to_dict(graph)
        logger.info(
            f"Built knowledge graph: {result['node_count']} nodes, {result['edge_count']} edges"
        )
        return result

    async def build_author_graph(self, authors: list) -> dict:
        graph = nx.Graph()
        for author in authors:
            aid = author.get("id") or author.get("name", "unknown")
            graph.add_node(
                aid,
                name=author.get("name", ""),
                affiliation=author.get("affiliation", ""),
                paper_count=author.get("paper_count", 0),
            )
            for coauthor in author.get("coauthors", []):
                coid = coauthor.get("id") or coauthor.get("name", "unknown")
                if not graph.has_node(coid):
                    graph.add_node(coid, name=coauthor.get("name", ""))
                graph.add_edge(aid, coid, relation="collaborates")
        result = await self._graph_to_dict(graph)
        logger.info(
            f"Built author graph: {result['node_count']} nodes, {result['edge_count']} edges"
        )
        return result

    async def build_dataset_graph(self, datasets: list, papers: list) -> dict:
        graph = nx.Graph()
        for ds in datasets:
            dsid = ds.get("id") or ds.get("name", "unknown")
            graph.add_node(dsid, type="dataset", name=ds.get("name", ""))
        for paper in papers:
            pid = paper.get("id") or paper.get("doi") or paper.get("title", "unknown")
            graph.add_node(pid, type="paper", title=paper.get("title", ""))
            for ds_name in paper.get("datasets", []):
                if graph.has_node(ds_name):
                    graph.add_edge(pid, ds_name, relation="uses")
        result = await self._graph_to_dict(graph)
        logger.info(
            f"Built dataset graph: {result['node_count']} nodes, {result['edge_count']} edges"
        )
        return result

    async def build_topic_graph(self, topics: list, papers: list) -> dict:
        graph = nx.Graph()
        for topic in topics:
            name = topic.get("name", "unknown")
            graph.add_node(name, type="topic", description=topic.get("description", ""))
        for paper in papers:
            pid = paper.get("id") or paper.get("doi") or paper.get("title", "unknown")
            graph.add_node(pid, type="paper", title=paper.get("title", ""))
            for kw in paper.get("keywords", []):
                if graph.has_node(kw):
                    graph.add_edge(pid, kw, relation="related_to")
            topic_name = paper.get("topic", "")
            if topic_name and graph.has_node(topic_name):
                graph.add_edge(pid, topic_name, relation="belongs_to")
        result = await self._graph_to_dict(graph)
        logger.info(
            f"Built topic graph: {result['node_count']} nodes, {result['edge_count']} edges"
        )
        return result

    async def cache_graph(self, workspace_id: str, graph_type: str, graph_data: dict):
        existing = await GraphCache.find_one(
            GraphCache.workspace_id == workspace_id,
            GraphCache.graph_type == graph_type,
        )
        if existing:
            existing.graph_data = graph_data
            existing.node_count = graph_data.get("node_count", 0)
            existing.edge_count = graph_data.get("edge_count", 0)
            existing.updated_at = datetime.utcnow()
            await existing.save()
        else:
            cache = GraphCache(
                workspace_id=workspace_id,
                graph_type=graph_type,
                graph_data=graph_data,
                node_count=graph_data.get("node_count", 0),
                edge_count=graph_data.get("edge_count", 0),
            )
            await cache.insert()
        logger.info(f"Cached {graph_type} graph for workspace {workspace_id}")

    async def get_cached_graph(
        self, workspace_id: str, graph_type: str
    ) -> Optional[dict]:
        cache = await GraphCache.find_one(
            GraphCache.workspace_id == workspace_id,
            GraphCache.graph_type == graph_type,
        )
        if cache:
            logger.debug(
                f"Retrieved cached {graph_type} graph for workspace {workspace_id}"
            )
            return cache.graph_data
        logger.debug(f"No cached {graph_type} graph found for workspace {workspace_id}")
        return None
