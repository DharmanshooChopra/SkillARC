import requests

# 2026 and 2027 Major Indian Festival Holidays
festivals = [
    # 2026
    {"name": "Makar Sankranti / Pongal", "date": "2026-01-14"},
    {"name": "Vasant Panchami", "date": "2026-01-24"},
    {"name": "Maha Shivaratri", "date": "2026-02-15"},
    {"name": "Holi", "date": "2026-03-03"},
    {"name": "Ugadi / Gudi Padwa", "date": "2026-03-20"},
    {"name": "Eid-ul-Fitr", "date": "2026-03-21"},
    {"name": "Ram Navami", "date": "2026-03-27"},
    {"name": "Baisakhi", "date": "2026-04-14"},
    {"name": "Raksha Bandhan", "date": "2026-08-28"},
    {"name": "Janmashtami", "date": "2026-09-04"},
    {"name": "Ganesh Chaturthi", "date": "2026-09-14"},
    {"name": "Onam", "date": "2026-08-27"},
    {"name": "Navratri Starts", "date": "2026-10-10"},
    {"name": "Dussehra", "date": "2026-10-19"},
    {"name": "Diwali", "date": "2026-11-08"},
    {"name": "Bhai Dooj", "date": "2026-11-10"},
    {"name": "Chhath Puja", "date": "2026-11-14"},
    {"name": "Christmas", "date": "2026-12-25"},
    
    # 2027
    {"name": "Makar Sankranti / Pongal", "date": "2027-01-15"},
    {"name": "Vasant Panchami", "date": "2027-02-11"},
    {"name": "Maha Shivaratri", "date": "2027-03-06"},
    {"name": "Eid-ul-Fitr", "date": "2027-03-10"},
    {"name": "Holi", "date": "2027-03-22"},
    {"name": "Ugadi / Gudi Padwa", "date": "2027-04-08"},
    {"name": "Ram Navami", "date": "2027-04-16"},
    {"name": "Baisakhi", "date": "2027-04-14"},
    {"name": "Raksha Bandhan", "date": "2027-08-17"},
    {"name": "Janmashtami", "date": "2027-08-25"},
    {"name": "Ganesh Chaturthi", "date": "2027-09-03"},
    {"name": "Onam", "date": "2027-09-15"},
    {"name": "Navratri Starts", "date": "2027-09-30"},
    {"name": "Dussehra", "date": "2027-10-09"},
    {"name": "Diwali", "date": "2027-10-29"},
    {"name": "Bhai Dooj", "date": "2027-10-31"},
    {"name": "Chhath Puja", "date": "2027-11-04"},
    {"name": "Christmas", "date": "2027-12-25"},
]

def seed():
    url = "http://127.0.0.1:8000/api/events"
    count = 0
    
    for f in festivals:
        # Convert YYYY-MM-DD to ISO8601 UTC
        iso_date = f"{f['date']}T00:00:00Z"
        
        payload = {
            "title": f["name"],
            "event_type": "holiday",
            "date": iso_date,
            "is_default": True,
            "classroom_id": None
        }
        
        try:
            res = requests.post(url, json=payload)
            if res.status_code == 200:
                print(f"Added: {f['name']} on {f['date']}")
                count += 1
            else:
                print(f"Failed {f['name']}: {res.text}")
        except Exception as e:
            print(f"Error {f['name']}: {e}")
            
    print(f"\nSuccessfully seeded {count} Indian festival holidays.")

if __name__ == "__main__":
    seed()
