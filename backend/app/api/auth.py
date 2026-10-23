from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from app.services.auth_service import AuthService

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


async def get_auth_service():
    return AuthService()


@router.post("/login")
async def login(
    body: LoginRequest, service: AuthService = Depends(get_auth_service)
):
    try:
        result = await service.login(body.email, body.password)
        return {"status": "success", "message": "Login successful", "data": result}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register")
async def register(
    body: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
):
    try:
        result = await service.register(body.email, body.password, body.name)
        return {
            "status": "success",
            "message": "Registration successful",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_me(user_id: Optional[str] = Query("guest"), service: AuthService = Depends(get_auth_service)):
    try:
        result = await service.get_current_user(user_id or "guest")
        return {"status": "success", "message": "User info retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/guest")
async def create_guest(service: AuthService = Depends(get_auth_service)):
    try:
        result = await service.create_guest_session()
        return {"status": "success", "message": "Guest session created", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
