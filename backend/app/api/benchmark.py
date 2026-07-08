from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.benchmark_service import BenchmarkService

router = APIRouter()


async def get_benchmark_service():
    return BenchmarkService()


@router.get("/")
async def list_benchmarks(
    q: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: BenchmarkService = Depends(get_benchmark_service),
):
    try:
        result = await service.search_benchmarks(q) if q else []
        return {"status": "success", "message": "Benchmarks retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{benchmark_id}")
async def get_benchmark(
    benchmark_id: str, service: BenchmarkService = Depends(get_benchmark_service)
):
    try:
        result = await service.get_benchmark_details(benchmark_id)
        if not result:
            raise HTTPException(status_code=404, detail="Benchmark not found")
        return {
            "status": "success",
            "message": "Benchmark details retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{benchmark_id}/leaderboard")
async def get_benchmark_leaderboard(
    benchmark_id: str, service: BenchmarkService = Depends(get_benchmark_service)
):
    try:
        result = await service.get_leaderboard(benchmark_id)
        return {"status": "success", "message": "Leaderboard retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
