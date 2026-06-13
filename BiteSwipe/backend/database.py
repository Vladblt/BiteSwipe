import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Aceasta comanda deschide seiful .env si citeste parolele
load_dotenv()

# Luam link-ul si cheia si le salvam in aplicatie
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

# Cream legatura oficiala cu Supabase
supabase_client: Client = create_client(url, key)