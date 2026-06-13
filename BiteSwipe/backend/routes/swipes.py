from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase_admin
from datetime import date

router = APIRouter()


class SwipeRequest(BaseModel):
    restaurant_id: str
    direction: str      # 'left' sau 'right'
    user_id: str        # UUID din Supabase Auth


@router.post("/")
def create_swipe(swipe: SwipeRequest):
    """
    Inregistreaza un swipe.
    Daca e dreapta, verifica disponibilitatea si returneaza rezultatul.
    """
    if swipe.direction not in ["left", "right"]:
        raise HTTPException(status_code=400, detail="Directie invalida: 'left' sau 'right'")

    # Salveaza swipe-ul
    try:
        supabase_admin.table("swipes").insert({
            "user_id": swipe.user_id,
            "restaurant_id": swipe.restaurant_id,
            "direction": swipe.direction
        }).execute()
    except Exception:
        # Constraint unique(user_id, restaurant_id) a fost incalcat
        raise HTTPException(status_code=409, detail="Ai dat deja swipe acestui restaurant")

    # Swipe stanga -> gata
    if swipe.direction == "left":
        return {"matched": False}

    # Swipe dreapta -> verificam locuri disponibile pentru azi
    today = date.today().isoformat()

    restaurant = supabase_admin.table("restaurants")\
        .select("capacity, name")\
        .eq("id", swipe.restaurant_id)\
        .single().execute()

    rezervari = supabase_admin.table("reservations")\
        .select("id", count="exact")\
        .eq("restaurant_id", swipe.restaurant_id)\
        .eq("reservation_date", today)\
        .in_("status", ["pending", "confirmed"])\
        .execute()

    total = rezervari.count or 0
    capacitate = restaurant.data["capacity"]
    are_locuri = total < capacitate

    return {
        "matched": are_locuri,
        "restaurant_name": restaurant.data["name"],
        "available_spots": max(0, capacitate - total)
    }
