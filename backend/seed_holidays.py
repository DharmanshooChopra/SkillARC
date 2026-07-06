import holidays
import requests
from datetime import datetime

def seed_indian_holidays(year=2026):
    # Fetch Indian holidays
    in_holidays = holidays.India(years=year)
    
    url = "http://127.0.0.1:8000/api/events"
    count = 0
    
    for date, name in in_holidays.items():
        # Convert date to datetime at midnight (ISO 8601 format)
        dt = datetime(date.year, date.month, date.day)
        iso_date = dt.isoformat() + "Z"
        
        payload = {
            "title": name,
            "event_type": "holiday",
            "date": iso_date,
            "is_default": True,
            "classroom_id": None # None means global holiday
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print(f"Added: {name} on {date}")
                count += 1
            else:
                print(f"Failed to add {name}: {response.text}")
        except Exception as e:
            print(f"Error adding {name}: {e}")
            
    print(f"\nSuccessfully seeded {count} Indian public holidays for {year}.")

if __name__ == "__main__":
    seed_indian_holidays(2026)
    seed_indian_holidays(2027)
