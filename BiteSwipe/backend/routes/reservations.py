from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase_admin

router = APIRouter()


class ReservationRequest(BaseModel):
    user_id: str
    restaurant_id: str
    reservation_date: str   # "2025-03-24"
    reservation_time: str   # "14:00"
    party_size: int
    notes: str = ""


@router.post("/")
def create_reservation(req: ReservationRequest):
    """
    Creeaza o rezervare cu status 'pending'.
    Restaurantul o vede instant prin Supabase Realtime.
    """
    if not (1 <= req.party_size <= 20):
        raise HTTPException(status_code=400, detail="Numar de persoane invalid (1-20)")

    # Verificare finala disponibilitate
    restaurant = supabase_admin.table("restaurants")\
        .select("capacity")\
        .eq("id", req.restaurant_id)\
        .single().execute()

    rezervari = supabase_admin.table("reservations")\
        .select("id", count="exact")\
        .eq("restaurant_id", req.restaurant_id)\
        .eq("reservation_date", req.reservation_date)\
        .in_("status", ["pending", "confirmed"])\
        .execute()

    if (rezervari.count or 0) >= restaurant.data["capacity"]:
        raise HTTPException(status_code=409, detail="Nu mai sunt locuri disponibile")

    result = supabase_admin.table("reservations").insert({
        "user_id": req.user_id,
        "restaurant_id": req.restaurant_id,
        "reservation_date": req.reservation_date,
        "reservation_time": req.reservation_time,
        "party_size": req.party_size,
        "notes": req.notes,
        "status": "pending"
    }).execute()

    return {
        "success": True,
        "reservation_id": result.data[0]["id"],
        "message": "Rezervare trimisa! Restaurantul va confirma in curand."
    }


@router.get("/restaurant/{restaurant_id}")
def get_restaurant_reservations(restaurant_id: str, data: str = None):
    """Rezervarile unui restaurant — pentru panoul staff-ului."""
    query = supabase_admin.table("reservations")\
        .select("*, profiles(full_name, phone)")\
        .eq("restaurant_id", restaurant_id)\
        .order("reservation_date")\
        .order("reservation_time")

    if data:
        query = query.eq("reservation_date", data)

    return query.execute().data


@router.patch("/{reservation_id}/status")
def update_status(reservation_id: str, status: str):
    """Staff-ul confirma sau respinge o rezervare."""
    if status not in ["confirmed", "rejected"]:
        raise HTTPException(status_code=400, detail="Status invalid: 'confirmed' sau 'rejected'")

    supabase_admin.table("reservations")\
        .update({"status": status})\
        .eq("id", reservation_id)\
        .execute()

    return {"success": True, "status": status}


@router.get("/user/{user_id}")
def get_user_reservations(user_id: str):
    """Istoricul rezervarilor unui client."""
    result = supabase_admin.table("reservations")\
        .select("*, restaurants(name, address, image_url)")\
        .eq("user_id", user_id)\
        .order("reservation_date", desc=True)\
        .execute()
    return result.data
