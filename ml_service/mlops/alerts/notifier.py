import requests
import json
import os
from datetime import datetime

# Pulling from environment variable for secure secrets management
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/MOCK/WEBHOOK/URL")

def trigger_alert(alert_title: str, severity: str, details: str):
    """
    Sends a critical alert to the MLOps engineering team.
    Severities: WARNING, CRITICAL
    """
    color = "#FF0000" if severity == "CRITICAL" else "#FFA500"
    
    payload = {
        "text": f"*{severity} ALERT:* {alert_title}",
        "attachments": [
            {
                "color": color,
                "fields": [
                    {
                        "title": "Time",
                        "value": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                        "short": True
                    },
                    {
                        "title": "Details",
                        "value": details,
                        "short": False
                    }
                ]
            }
        ]
    }
    
    # Mocking the actual HTTP post to avoid failing without a real URL
    print("\n" + "="*50)
    print("! SIMULATED MLOps ALERT TRIGGERED !")
    print(f"Severity: {severity}")
    print(f"Title: {alert_title}")
    print(f"Details: {details}")
    print("="*50 + "\n")
    
    # requests.post(SLACK_WEBHOOK_URL, data=json.dumps(payload), headers={'Content-Type': 'application/json'})
