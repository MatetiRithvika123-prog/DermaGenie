import httpx
import asyncio

async def test_workflow():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        print("Testing Profile...")
        resp = await client.post("/api/profile", json={
            "name": "Test User",
            "age": 25,
            "gender": "Female",
            "place": "New York"
        })
        print(resp.status_code, resp.text)
        session_id = resp.json()["session_id"]
        
        print("Testing Skin Analysis...")
        resp = await client.post("/api/skin-analysis", json={
            "session_id": session_id,
            "skin_type": "Oily",
            "skin_issues": ["Acne", "Redness"],
            "issue_duration": "1-5 years",
            "severity": 6
        })
        print(resp.status_code, resp.text)
        
        print("Testing Analyze...")
        resp = await client.post("/api/analyze", json={
            "session_id": session_id,
            "ingredients": ["Water", "Glycerin", "Salicylic Acid", "Fragrance"]
        }, timeout=30.0)
        print(resp.status_code, resp.text)
        
        print("Testing Results...")
        resp = await client.get(f"/api/results/{session_id}")
        print(resp.status_code, resp.json()["suitability_score"])
        print("Done!")

if __name__ == "__main__":
    asyncio.run(test_workflow())
