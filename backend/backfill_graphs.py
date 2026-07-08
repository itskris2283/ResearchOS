import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.graph_cache import GraphCache
from app.models.paper import Paper
from app.models.workspace import Workspace
from app.services.graph_service import GraphService

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.researchos
    
    await init_beanie(database=db, document_models=[GraphCache, Paper, Workspace])
    
    # Get all workspaces
    workspaces = await db.workspaces.find().to_list(None)
    graph_service = GraphService()
    
    common_datasets = ["ImageNet", "COCO", "VQA", "CIFAR-10", "MNIST", "SQuAD", "GLUE", "Kitti", "Cityscapes", "Waymo"]
    common_methods = ["Transformer", "CNN", "RNN", "LSTM", "GAN", "Diffusion", "Reinforcement Learning", "SVM", "Random Forest", "ViT", "LoRA", "ResNet"]
    
    for ws in workspaces:
        ws_id = str(ws["_id"])
        papers = await db.papers.find({"workspace_id": ws_id}).to_list(None)
        
        updated_papers = []
        for p in papers:
            title = p.get("title") or ""
            abstract = p.get("abstract") or ""
            text = (title + " " + abstract).lower()
            
            p_datasets = p.get("datasets") or []
            if not p_datasets:
                p_datasets = [ds for ds in common_datasets if ds.lower() in text]
            p["datasets"] = p_datasets
                
            p_methods = p.get("methods") or []
            if not p_methods:
                p_methods = [m for m in common_methods if m.lower() in text]
            p["methods"] = p_methods
            
            # Save updated paper
            await db.papers.update_one({"_id": p["_id"]}, {"$set": {"datasets": p["datasets"], "methods": p["methods"]}})
            
            # Convert _id to str for graph service
            p["id"] = str(p["_id"])
            p["_id"] = str(p["_id"])
            updated_papers.append(p)
            
        print(f"Updated {len(updated_papers)} papers for workspace {ws_id}")
        
        if updated_papers:
            # Rebuild knowledge graph
            kg = await graph_service.build_knowledge_graph(updated_papers, [], [], [])
            await graph_service.cache_graph(ws_id, "knowledge", kg)
            print(f"Rebuilt knowledge graph for {ws_id}: {kg['node_count']} nodes")
            
            concept_graph = await graph_service.build_concept_graph(concepts=[], papers=updated_papers)
            await graph_service.cache_graph(ws_id, "concept", concept_graph)
            print(f"Rebuilt concept graph for {ws_id}: {concept_graph['node_count']} nodes, {concept_graph['edge_count']} edges")

if __name__ == "__main__":
    asyncio.run(main())
