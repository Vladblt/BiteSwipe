from fastapi import APIRouter, HTTPException
from database import supabase_admin
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/")
def get_restaurants(city: str = "București", cuisine: str = None, limit: int = 20):
    """Returneaza lista de restaurante pentru swipe."""
    query = supabase_admin.table("restaurants")\
        .select("*")\
        .eq("city", city)\
        .eq("is_active", True)

    if cuisine:
        query = query.eq("cuisine_type", cuisine)

    result = query.limit(limit).execute()
    return result.data


@router.get("/{restaurant_id}/availability")
def check_availability(restaurant_id: str, date: str):
    """
    Verifica disponibilitatea si returneaza sloturile orare.
    date: format YYYY-MM-DD
    """
    restaurant = supabase_admin.table("restaurants")\
        .select("capacity, opening_time, closing_time, name")\
        .eq("id", restaurant_id)\
        .single().execute()

    if not restaurant.data:
        raise HTTPException(status_code=404, detail="Restaurant negasit")

    capacity = restaurant.data["capacity"]

    rezervari = supabase_admin.table("reservations")\
        .select("reservation_time")\
        .eq("restaurant_id", restaurant_id)\
        .eq("reservation_date", date)\
        .in_("status", ["pending", "confirmed"])\
        .execute()

    # Numara cate rezervari sunt per slot orar
    occupied = {}
    for r in rezervari.data:
        t = r["reservation_time"][:5]  # "14:00:00" -> "14:00"
        occupied[t] = occupied.get(t, 0) + 1

    # Genereaza sloturile din 30 in 30 minute
    slots = []
    start = datetime.strptime(restaurant.data["opening_time"], "%H:%M:%S")
    end   = datetime.strptime(restaurant.data["closing_time"], "%H:%M:%S") - timedelta(hours=1)
    current = start
    max_per_slot = max(1, capacity // 4)

    while current <= end:
        time_str = current.strftime("%H:%M")
        slots.append({
            "time": time_str,
            "available": occupied.get(time_str, 0) < max_per_slot
        })
        current += timedelta(minutes=30)

    return {
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant.data["name"],
        "date": date,
        "slots": slots,
        "has_availability": any(s["available"] for s in slots)
    }
