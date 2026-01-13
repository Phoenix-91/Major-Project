from langchain.tools import tool
from typing import Optional, List
from datetime import datetime, timedelta
import json

@tool
def schedule_meeting(
    title: str,
    attendees: str,
    start_time: str,
    duration_minutes: int = 60,
    description: str = ""
) -> str:
    """
    Schedules a meeting on the calendar.
    
    Args:
        title: Meeting title/topic
        attendees: Comma-separated list of attendee emails
        start_time: Start time in ISO format or natural language (e.g., "tomorrow at 2pm")
        duration_minutes: Meeting duration in minutes (default 60)
        description: Optional meeting description
    """
    # Parse time (simplified - in production use dateparser or similar)
    try:
        # Try ISO format first
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    except:
        # Fallback to current time + 1 day for demo
        start_dt = datetime.now() + timedelta(days=1)
    
    end_dt = start_dt + timedelta(minutes=duration_minutes)
    
    attendee_list = [email.strip() for email in attendees.split(',')]
    
    print(f"📅 Scheduling meeting: {title}")
    print(f"Time: {start_dt.strftime('%Y-%m-%d %H:%M')} - {end_dt.strftime('%H:%M')}")
    print(f"Attendees: {', '.join(attendee_list)}")
    
    return json.dumps({
        "success": True,
        "message": f"Meeting '{title}' scheduled successfully",
        "title": title,
        "attendees": attendee_list,
        "start_time": start_dt.isoformat(),
        "end_time": end_dt.isoformat(),
        "duration_minutes": duration_minutes,
        "description": description
    })

@tool
def check_calendar_conflicts(date: str) -> str:
    """
    Checks for scheduling conflicts on a specific date.
    
    Args:
        date: Date to check in YYYY-MM-DD format
    """
    # Mock implementation - in production, query actual calendar
    print(f"🔍 Checking calendar for {date}")
    
    # Simulate no conflicts for demo
    return json.dumps({
        "date": date,
        "has_conflicts": False,
        "conflicts": [],
        "available_slots": [
            "09:00-10:00",
            "10:00-11:00",
            "14:00-15:00",
            "15:00-16:00"
        ]
    })

@tool
def cancel_meeting(meeting_id: str, reason: str = "") -> str:
    """
    Cancels a scheduled meeting.
    
    Args:
        meeting_id: ID of the meeting to cancel
        reason: Optional cancellation reason
    """
    print(f"❌ Cancelling meeting: {meeting_id}")
    if reason:
        print(f"Reason: {reason}")
    
    return json.dumps({
        "success": True,
        "message": f"Meeting {meeting_id} cancelled successfully",
        "meeting_id": meeting_id,
        "reason": reason
    })

@tool
def reschedule_meeting(
    meeting_id: str,
    new_start_time: str,
    notify_attendees: bool = True
) -> str:
    """
    Reschedules an existing meeting to a new time.
    
    Args:
        meeting_id: ID of the meeting to reschedule
        new_start_time: New start time in ISO format
        notify_attendees: Whether to notify attendees of the change
    """
    print(f"🔄 Rescheduling meeting: {meeting_id}")
    print(f"New time: {new_start_time}")
    
    return json.dumps({
        "success": True,
        "message": f"Meeting rescheduled to {new_start_time}",
        "meeting_id": meeting_id,
        "new_start_time": new_start_time,
        "attendees_notified": notify_attendees
    })

def get_calendar_tools():
    """Returns all calendar-related tools"""
    return [
        schedule_meeting,
        check_calendar_conflicts,
        cancel_meeting,
        reschedule_meeting
    ]
