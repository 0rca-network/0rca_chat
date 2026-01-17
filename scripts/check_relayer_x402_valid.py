import requests
import json
import time
from eth_account import Account
import os

def test_relay_handshake():
    api_url = "http://144.126.253.20"
    pk = "63918bb7d149f6cc03b40aeff33aff6da1736a1fe1f479f0da95e694698f69dc" # Orchestrator PK
    acc = Account.from_key(pk)
    
    # Get nonce
    nonce_resp = requests.get(f"{api_url}/meta/nonce/{acc.address}")
    nonce = nonce_resp.json()['nonce']
    
    # Get domain
    domain_resp = requests.get(f"{api_url}/meta/domain")
    domain_data = domain_resp.json()
    domain = domain_data['domain']
    types = domain_data['types']
    
    deadline = int(time.time()) + 3600
    
    request = {
        "from": acc.address,
        "to": "0xe7bad567ed213efE7Dd1c31DF554461271356F30",
        "value": 0,
        "gas": 200000,
        "nonce": int(nonce),
        "deadline": deadline,
        "data": bytes.fromhex("1234")
    }
    
    signable_data = {
        "types": {
            "EIP712Domain": [
                {"name": "name", "type": "string"},
                {"name": "version", "type": "string"},
                {"name": "chainId", "type": "uint256"},
                {"name": "verifyingContract", "type": "address"}
            ],
            "ForwardRequest": types["ForwardRequest"]
        },
        "primaryType": "ForwardRequest",
        "domain": domain,
        "message": request
    }
    
    signature = Account.sign_typed_data(pk, full_message=signable_data).signature.hex()
    if not signature.startswith("0x"): signature = "0x" + signature
    
    payload = {
        "request": {
            **request,
            "data": "0x1234",
            "value": str(request["value"]),
            "gas": str(request["gas"]),
            "nonce": str(request["nonce"]),
            "deadline": str(request["deadline"])
        },
        "signature": signature
    }
    
    print(f"Requesting relay for valid signature...")
    resp = requests.post(f"{api_url}/meta/relay", json=payload)
    
    if resp.status_code == 402:
        print("402 Received!")
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Response {resp.status_code}: {resp.text}")

if __name__ == "__main__":
    test_relay_handshake()
