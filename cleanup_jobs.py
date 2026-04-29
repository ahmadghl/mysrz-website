from app.core.database import get_db
import os

db = get_db()
# Fetch all jobs that aren't 'completed' or 'failed'
jobs = db.table("crawl_jobs").select("id, status").execute().data or []
stuck_ids = [j['id'] for j in jobs if j['status'] not in ['completed', 'failed']]

if stuck_ids:
    print(f"Cleaning up {len(stuck_ids)} stuck jobs...")
    for j_id in stuck_ids:
        db.table("crawl_jobs").update({"status": "failed", "error_message": "Force Reset"}).eq("id", j_id).execute()
    print("Cleanup complete.")
else:
    print("No stuck jobs found.")
