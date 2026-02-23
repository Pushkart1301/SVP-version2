import requests
import datetime
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

EMAIL = "1032230410@tcetmumbai.in"
PASSWORD = "tcet"
USERNAME = "tcet"

def main():
    session = requests.Session()
    
    # 1. Login (or Register)
    print("Attempting to login...")
    login_data = {
        "username": EMAIL, # OAuth2PasswordRequestForm uses 'username' for email often
        "password": PASSWORD
    }
    # try as form data first
    res = session.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if res.status_code != 200:
        # try as JSON? In fastapi usually it's form data for login
        # let's try register just in case it doesn't exist
        print("Login failed, attempting to register...")
        reg_res = session.post(f"{BASE_URL}/auth/register", json={
            "email": EMAIL,
            "password": PASSWORD,
            "full_name": USERNAME
        })
        if reg_res.status_code == 200:
            print("Registered successfully. Logging in again...")
            res = session.post(f"{BASE_URL}/auth/login", data=login_data)
            if res.status_code != 200:
                print("Failed to login after registration.", res.json())
                sys.exit(1)
        else:
            print("Failed to register and login:", res.json(), reg_res.text)
            sys.exit(1)
            
    token = res.json().get("access_token")
    if not token:
        print("No access token found.")
        sys.exit(1)
        
    print("Logged in successfully!")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # 2. Add Dummy Subjects
    dummy_subjects = [
        {"name": "Artificial Intelligence", "code": "AI-401", "target_attendance_percent": 75},
        {"name": "Web Development", "code": "WD-402", "target_attendance_percent": 75},
        {"name": "Cloud Computing", "code": "CC-403", "target_attendance_percent": 75},
        {"name": "Machine Learning", "code": "ML-404", "target_attendance_percent": 75}
    ]
    
    print("Adding dummy subjects...")
    added_subjects = []
    
    # fetch existing first to not double add
    existing_subs_res = session.get(f"{BASE_URL}/subjects", headers=headers)
    existing_codes = []
    if existing_subs_res.status_code == 200:
        existing_codes = [s['code'] for s in existing_subs_res.json()]
        for s in existing_subs_res.json():
            if s['code'] in [ds['code'] for ds in dummy_subjects]:
                added_subjects.append(s)
                
    for sub in dummy_subjects:
        if sub['code'] not in existing_codes:
            sub_res = session.post(f"{BASE_URL}/subjects", json=sub, headers=headers)
            if sub_res.status_code == 200:
                print(f"Added {sub['name']}")
                added_subjects.append(sub_res.json())
            else:
                print(f"Failed to add {sub['name']}:", sub_res.text)
                
    if not added_subjects:
        print("No subjects to mark attendance for.")
        sys.exit(1)
        
    # 3. Mark 100% Attendance for last 30 days
    today = datetime.datetime.now()
    dates_to_mark = [(today - datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
    
    print("Marking 100% attendance for the past 30 days...")
    for dt in dates_to_mark:
        entries = [{"subject_id": s["_id"], "status": "P"} for s in added_subjects]
        att_res = session.post(f"{BASE_URL}/attendance", json={
            "date": dt,
            "entries": entries
        }, headers=headers)
        
        if att_res.status_code == 200:
            print(f"Marked all present for {dt}")
        else:
            print(f"Failed for {dt}:", att_res.text)
            
    print("Script finished successfully!")

if __name__ == "__main__":
    main()
