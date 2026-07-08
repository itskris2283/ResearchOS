import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.graph_service import GraphService

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.researchos  # Correct DB name!
    
    # Get all workspaces
    workspaces = await db.workspaces.find().to_list(None)
    graph_service = GraphService()
    
    for ws in workspaces:
        ws_id = str(ws["_id"])
        papers = await db.papers.find({"workspace_id": ws_id}).to_list(None)
        
        for p in papers:
            p["id"] = str(p["_id"])
            p["_id"] = str(p["_id"])
            
        print(f"Loaded {len(papers)} papers for workspace {ws_id}")
        
        if papers:
            # Rebuild concept graph with the updated logic
            concept_graph = await graph_service.build_concept_graph(concepts=[], papers=papers)
            await graph_service.cache_graph(ws_id, "concept", concept_graph)
            
            print(f"Rebuilt concept graph for {ws_id}: {concept_graph['node_count']} nodes, {concept_graph['edge_count']} edges")

if __name__ == "__main__":
    asyncio.run(main())
