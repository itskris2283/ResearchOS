import asyncio
from difflib import SequenceMatcher
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger()

SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1"
OPENALEX_BASE = "https://api.openalex.org"
CROSSREF_BASE = "https://api.crossref.org/works"
ARXIV_BASE = "https://export.arxiv.org/api/query"
PWC_BASE = "https://paperswithcode.com/api/v1"


class PaperService:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    )
    async def search_semantic_scholar(self, query: str, limit: int = 20) -> list:
        try:
            headers = {}
            if settings.SEMANTIC_SCHOLAR_API_KEY:
                headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{SEMANTIC_SCHOLAR_BASE}/paper/search",
                    params={
                        "query": query,
                        "limit": limit,
                        "fields": "title,abstract,year,venue,citationCount,authors,externalIds,url",
                    },
                    headers=headers,
                )
                resp.raise_for_status()
                data = resp.json()
                papers = []
                for p in data.get("data", []):
                    papers.append(
                        {
                            "title": p.get("title"),
                            "abstract": p.get("abstract"),
                            "year": p.get("year"),
                            "venue": p.get("venue"),
                            "citation_count": p.get("citationCount", 0),
                            "doi": (p.get("externalIds") or {}).get("DOI"),
                            "paper_url": p.get("url"),
                            "authors": [
                                {"name": a.get("name"), "id": a.get("authorId")}
                                for a in p.get("authors", [])
                            ],
                            "paper_source": "semantic_scholar",
                        }
                    )
                logger.info(
                    f"Semantic Scholar returned {len(papers)} papers for '{query}'"
                )
                return papers
        except Exception as e:
            logger.error(f"Semantic Scholar search failed: {e}")
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    )
    async def search_openalex(self, query: str, limit: int = 20) -> list:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{OPENALEX_BASE}/works",
                    params={"search": query, "per_page": limit},
                )
                resp.raise_for_status()
                data = resp.json()
                papers = []
                for p in data.get("results", []):
                    if not p:
                        continue
                    abstract_inv = p.get("abstract_inverted_index")
                    abstract_text = None
                    if abstract_inv:
                        words = []
                        for word, positions in abstract_inv.items():
                            for pos in positions:
                                words.append((pos, word))
                        words.sort()
                        abstract_text = " ".join([w[1] for w in words])
                        
                    primary_loc = p.get("primary_location") or {}
                    source = primary_loc.get("source") or {}
                    open_access = p.get("open_access") or {}
                    
                    papers.append(
                        {
                            "title": p.get("title"),
                            "abstract": abstract_text,
                            "year": p.get("publication_year"),
                            "venue": source.get("display_name"),
                            "citation_count": p.get("cited_by_count", 0),
                            "doi": p.get("doi"),
                            "paper_url": open_access.get("oa_url"),
                            "authors": [
                                {
                                    "name": (a.get("author") or {}).get("display_name"),
                                    "id": (a.get("author") or {}).get("id"),
                                }
                                for a in p.get("authorships", []) if a
                            ],
                            "paper_source": "openalex",
                        }
                    )
                logger.info(f"OpenAlex returned {len(papers)} papers for '{query}'")
                return papers
        except Exception as e:
            logger.error(f"OpenAlex search failed: {e}")
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    )
    async def search_crossref(self, query: str, limit: int = 20) -> list:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    CROSSREF_BASE,
                    params={"query": query, "rows": limit},
                )
                resp.raise_for_status()
                data = resp.json()
                papers = []
                for item in data.get("message", {}).get("items", []):
                    papers.append(
                        {
                            "title": item.get("title", [""])[0]
                            if item.get("title")
                            else None,
                            "abstract": None,
                            "year": (
                                item.get("published-print")
                                or item.get("published-online")
                                or {}
                            ).get("date-parts", [[None]])[0][0],
                            "venue": item.get("container-title", [""])[0]
                            if item.get("container-title")
                            else None,
                            "citation_count": item.get("is-referenced-by-count", 0),
                            "doi": item.get("DOI"),
                            "paper_url": item.get("URL"),
                            "authors": [
                                {
                                    "name": a.get("given", "")
                                    + " "
                                    + a.get("family", ""),
                                    "id": a.get("ORCID"),
                                }
                                for a in item.get("author", [])
                            ],
                            "paper_source": "crossref",
                        }
                    )
                logger.info(f"CrossRef returned {len(papers)} papers for '{query}'")
                return papers
        except Exception as e:
            logger.error(f"CrossRef search failed: {e}")
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    )
    async def search_arxiv(self, query: str, limit: int = 20) -> list:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    ARXIV_BASE,
                    params={"search_query": f"all:{query}", "max_results": limit},
                )
                resp.raise_for_status()
                import xml.etree.ElementTree as ET

                root = ET.fromstring(resp.content)
                ns = {
                    "atom": "http://www.w3.org/2005/Atom",
                    "arxiv": "http://arxiv.org/schemas/atom",
                }
                papers = []
                for entry in root.findall("atom:entry", ns):
                    title_el = entry.find("atom:title", ns)
                    summary_el = entry.find("atom:summary", ns)
                    published_el = entry.find("atom:published", ns)
                    doi_el = entry.find("arxiv:doi", ns)
                    id_el = entry.find("atom:id", ns)
                    papers.append(
                        {
                            "title": title_el.text.strip()
                            if title_el is not None
                            else None,
                            "abstract": summary_el.text.strip()
                            if summary_el is not None
                            else None,
                            "year": int(published_el.text[:4])
                            if published_el is not None
                            else None,
                            "venue": "arXiv",
                            "citation_count": 0,
                            "doi": doi_el.text if doi_el is not None else None,
                            "paper_url": id_el.text if id_el is not None else None,
                            "authors": [
                                {"name": a.find("atom:name", ns).text}
                                for a in entry.findall("atom:author", ns)
                                if a.find("atom:name", ns) is not None
                            ],
                            "paper_source": "arxiv",
                        }
                    )
                logger.info(f"arXiv returned {len(papers)} papers for '{query}'")
                return papers
        except Exception as e:
            logger.error(f"arXiv search failed: {e}")
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    )
    async def search_papers_with_code(self, query: str, limit: int = 20) -> list:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{PWC_BASE}/papers/",
                    params={"q": query, "items_per_page": limit},
                )
                resp.raise_for_status()
                data = resp.json()
                papers = []
                for p in data.get("results", []):
                    papers.append(
                        {
                            "title": p.get("title"),
                            "abstract": None,
                            "year": p.get("year"),
                            "venue": None,
                            "citation_count": 0,
                            "doi": None,
                            "paper_url": p.get("url_abs"),
                            "implementation_links": [p.get("url_code")]
                            if p.get("url_code")
                            else [],
                            "authors": [{"name": a} for a in p.get("authors", [])],
                            "paper_source": "papers_with_code",
                        }
                    )
                logger.info(
                    f"Papers With Code returned {len(papers)} papers for '{query}'"
                )
                return papers
        except Exception as e:
            logger.error(f"Papers With Code search failed: {e}")
            return []

    async def search_all_sources(self, query: str) -> list:
        tasks = [
            self.search_semantic_scholar(query),
            self.search_openalex(query),
            self.search_crossref(query),
            self.search_arxiv(query),
            self.search_papers_with_code(query),
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_papers = []
        for i, res in enumerate(results):
            if isinstance(res, Exception):
                logger.error(f"Source {i} failed: {res}")
            else:
                all_papers.extend(res)
        logger.info(
            f"All sources returned {len(all_papers)} total papers for '{query}'"
        )
        return all_papers

    async def deduplicate(self, papers: list) -> list:
        unique = []
        seen_dois = set()
        seen_titles = set()
        for paper in papers:
            doi = (paper.get("doi") or "").strip().lower()
            if doi and doi in seen_dois:
                continue
            if doi:
                seen_dois.add(doi)
            raw_title = paper.get("title") or ""
            clean_title = "".join(c for c in raw_title.lower() if c.isalnum() or c.isspace()).strip()
            if not clean_title:
                unique.append(paper)
                continue
            if clean_title in seen_titles:
                continue
            seen_titles.add(clean_title)
            unique.append(paper)
        logger.info(f"Deduplicated {len(papers)} -> {len(unique)} papers")
        return unique

    async def get_paper_details(self, paper_id: str) -> dict:
        try:
            headers = {}
            if settings.SEMANTIC_SCHOLAR_API_KEY:
                headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{SEMANTIC_SCHOLAR_BASE}/paper/{paper_id}",
                    params={
                        "fields": "title,abstract,year,venue,citationCount,authors,externalIds,url,references,citations"
                    },
                    headers=headers,
                )
                resp.raise_for_status()
                data = resp.json()
                return {
                    "title": data.get("title"),
                    "abstract": data.get("abstract"),
                    "year": data.get("year"),
                    "venue": data.get("venue"),
                    "citation_count": data.get("citationCount", 0),
                    "doi": (data.get("externalIds") or {}).get("DOI"),
                    "paper_url": data.get("url"),
                    "authors": [
                        {"name": a.get("name"), "id": a.get("authorId")}
                        for a in data.get("authors", [])
                    ],
                    "references": [
                        r.get("paperId")
                        for r in data.get("references", [])
                        if r.get("paperId")
                    ],
                    "citations": [
                        c.get("paperId")
                        for c in data.get("citations", [])
                        if c.get("paperId")
                    ],
                    "paper_source": "semantic_scholar",
                }
        except Exception as e:
            logger.error(f"Failed to get paper details for {paper_id}: {e}")
            return {}
