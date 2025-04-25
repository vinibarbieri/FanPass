import json
import os

def generate_metadata_file(name, description, image_url, attributes, base_filename="token_uri"):
    i = 1
    # Verifica se já existe o arquivo token_uri{i}.json
    while os.path.exists(f"{base_filename}{i}.json"):
        i += 1

    filename = f"{base_filename}{i}.json"
    
    metadata = {
        "name": name,
        "description": description,
        "image": image_url,
        "attributes": attributes
    }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"Arquivo '{filename}' gerado com sucesso!")



# Ingresso flamengo
name = "Ingresso Flamengo - Setor Camarote"
description = "Ingresso NFT do Flamengo válido para a temporada 2025. Acesso ao setor Camarote da Arena Maracanã."
image_url = "https://brown-obliged-albatross-730.mypinata.cloud/ipfs/bafybeibk66cp4pvfdk7wvq3talsegpgwdy2azhl37y722bi5jwzo3d6mnu/Flamengo.png"
attributes = [
    { "trait_type": "Clube", "value": "Flamengo" },
    { "trait_type": "Setor", "value": "Camarote" },
    { "trait_type": "Validade", "value": "Temporada 2025" }
]






# Gere quantos quiser, os nomes serão token_uri1.json, token_uri2.json...
generate_metadata_file(name, description, image_url, attributes)
