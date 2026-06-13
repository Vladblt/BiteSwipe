from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
def auth_status():
    # Auth e gestionat direct din frontend prin Supabase JS SDK
    return {"message": "Auth gestionat de Supabase din frontend"}
