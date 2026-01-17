import requests
import json
import time
from eth_account import Account

def test_relay_handshake():
    api_url = "http://144.126.253.20"
    
    # Random wallet
    acc = Account.create()
    
    # Dummy request
    request = {
        "from": acc.address,
        "to": "0xe7bad567ed213efE7Dd1c31DF554461271356F30",
        "value": "0",
        "gas": "200000",
        "nonce": "0",
        "deadline": str(int(time.time()) + 3600),
        "data": "0x1234"
    }
    
    payload = {
        "request": request,
        "signature": "0x" + "00"*65 # Dummy signature
    }
    
    print(f"Requesting relay for dummy...")
    resp = requests.post(f"{api_url}/meta/relay", json=payload)
    
    if resp.status_code == 402:
        print("402 Received!")
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Response {resp.status_code}: {resp.text}")

if __name__ == "__main__":
    test_relay_handshake()
