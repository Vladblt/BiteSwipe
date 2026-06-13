from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
import resend

# 1. Configurare Mediu
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Inițializare Clienți (Supabase și Resend)
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

resend.api_key = os.getenv("RESEND_API_KEY")

# 3. Modele de Date
class RezervareData(BaseModel):
    restaurant_id: int
    nume_client: str
    numar_persoane: int
    data_ora: str
    email_client: str  # FĂRĂ LOCAȚIE AICI

class UserData(BaseModel):
    email: str
    password: str

# Modelul pentru adăugarea unui restaurant de către patron
class RestaurantNou(BaseModel):
    nume: str
    descriere: str
    imagine_url: str
    locatie: str  

# 4. Rute Autentificare
@app.post("/register")
def register_user(user: UserData):
    try:
        # Creează utilizatorul în sistemul Auth
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        # Opțional: Creează profilul în tabelul 'profil_utilizator'
        if auth_response.user:
            supabase.table("profil_utilizator").insert({
                "id": auth_response.user.id,
                "email": user.email
            }).execute()
            
        return {"status": "success", "message": "Cont creat!"}
    except Exception as e:
        print(f"Eroare register: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/login")
def login_user(user: UserData):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        return {"status": "success", "email": user.email}
    except Exception as e:
        print(f"Eroare login: {e}")
        return {"status": "error", "message": "Date incorecte!"}

# 5. Rute Restaurante și Rezervări
@app.get("/restaurante")
def get_restaurants():
    try:
        # Filtrăm direct din baza de date ca să le aducem DOAR pe cele aprobate
        response = supabase.table("restaurante").select("*").eq("stare", "aprobat").execute()
        return response.data
    except Exception as e:
        print(f"Eroare fetch restaurante: {e}")
        return []

@app.post("/adauga_restaurant")
def add_restaurant(data: RestaurantNou):
    try:
        supabase.table("restaurante").insert({
            "nume": data.nume,
            "descriere": data.descriere,
            "imagine_url": data.imagine_url,
            "locatie": data.locatie,
            "stare": "in_asteptare" 
        }).execute()
        return {"status": "success", "message": "Restaurantul a fost trimis spre aprobare!"}
    except Exception as e:
        print(f"Eroare adăugare restaurant: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/rezerva")
def create_reservation(data: RezervareData):
    try:
        # PAS 1: Salvare în tabelul 'rezervari'
        supabase.table("rezervari").insert({
            "restaurant_id": data.restaurant_id,
            "nume_client": data.nume_client,
            "numar_persoane": data.numar_persoane,
            "data_ora": data.data_ora,
            "stare": "in_asteptare"
            # AM ȘTERS RÂNDUL CU "locatie": data.locatie
        }).execute()

        # PAS 2: Obținere nume restaurant pentru email
        res_info = supabase.table("restaurante").select("nume").eq("id", data.restaurant_id).execute()
        nume_restaurant = res_info.data[0]["nume"] if res_info.data else "Restaurant"

        # PAS 3: Trimitere Email prin Resend
        if resend.api_key:
            resend.Emails.send({
                "from": "BiteSwipe <onboarding@resend.dev>",
                "to": [data.email_client],
                "subject": f"Rezervare confirmată la {nume_restaurant} 🎉",
                "html": f"""
                    <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #e63946;">Salut, {data.nume_client}!</h2>
                        <p>Rezervarea ta la <strong>{nume_restaurant}</strong> a fost înregistrată.</p>
                        <p><strong>Detalii:</strong><br>
                        Persoane: {data.numar_persoane}<br>
                        Data/Ora: {data.data_ora}</p>
                        <p style="font-size: 12px; color: #777;">Te așteptăm cu drag!</p>
                    </div>
                """
            })

        return {"status": "success", "message": "Rezervare finalizată cu email!"}
    except Exception as e:
        print(f"Eroare procesare rezervare: {e}")
        return {"status": "error", "message": str(e)}