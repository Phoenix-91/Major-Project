# AI Agent Automation Platform - API Documentation

## Base URLs
- **Development**: http://localhost:5000/api
- **Production**: https://your-domain.com/api

## Authentication
All endpoints (except public routes) require Clerk authentication.

Include the Clerk session token in the Authorization header:
```
Authorization: Bearer <clerk_session_token>
```

---

## Agent Commands

### Process Command
Execute a natural language command with the AI agent.

**Endpoint**: `POST /agents/command`

**Request Body**:
```json
{
  "command": "Draft an email to john@example.com about the project update",
  "user_id": "user_123",
  "context": {
    "timezone": "America/New_York"
  }
}
```

**Response** (Success):
```json
{
  "status": "success",
  "plan": {
    "steps": [
      {
        "tool_name": "draft_email",
        "tool_input": {
          "recipient": "john@example.com",
          "subject": "Project Update",
          "context": "project update"
        },
        "reasoning": "User wants to draft an email",
        "risk_level": "low",
        "confidence": 0.95
      }
    ],
    "original_command": "Draft an email..."
  },
  "result": "Email drafted successfully",
  "execution_time": 1.23
}
```

**Response** (Requires Confirmation):
```json
{
  "status": "awaiting_confirmation",
  "plan": { ... },
  "requires_confirmation": true,
  "risk_level": "high",
  "message": "This action requires your confirmation before proceeding."
}
```

---

## Emails

### List Emails
Get all emails for the authenticated user.

**Endpoint**: `GET /emails`

**Response**:
```json
[
  {
    "_id": "email_123",
    "userId": "user_123",
    "recipient": "john@example.com",
    "subject": "Project Update",
    "body": "Hi John...",
    "status": "draft",
    "tone": "professional",
    "aiGenerated": true,
    "createdAt": "2026-01-13T10:00:00Z"
  }
]
```

### Draft Email
Create an AI-generated email draft.

**Endpoint**: `POST /emails/draft`

**Request Body**:
```json
{
  "recipient": "john@example.com",
  "subject": "Project Update",
  "context": "Need to update John about the Q1 progress",
  "tone": "professional"
}
```

### Send Email
Send a drafted email.

**Endpoint**: `POST /emails/:id/send`

**Response**:
```json
{
  "_id": "email_123",
  "status": "sent",
  "sentAt": "2026-01-13T10:05:00Z"
}
```

---

## Calendar

### List Events
Get upcoming calendar events.

**Endpoint**: `GET /calendar`

**Query Parameters**:
- `limit` (optional): Number of events to return (default: 50)

**Response**:
```json
[
  {
    "_id": "event_123",
    "title": "Team Meeting",
    "startTime": "2026-01-14T14:00:00Z",
    "endTime": "2026-01-14T15:00:00Z",
    "attendees": [
      {
        "email": "sarah@example.com",
        "name": "Sarah",
        "status": "pending"
      }
    ],
    "conflictDetected": false,
    "aiGenerated": true
  }
]
```

### Schedule Meeting
Create a new calendar event.

**Endpoint**: `POST /calendar/schedule`

**Request Body**:
```json
{
  "title": "Project Review",
  "attendees": ["sarah@example.com"],
  "startTime": "2026-01-15T10:00:00Z",
  "endTime": "2026-01-15T11:00:00Z",
  "description": "Q1 project review meeting",
  "command": "Schedule a meeting with Sarah tomorrow at 10am"
}
```

**Response**:
```json
{
  "event": { ... },
  "conflicts": []
}
```

### Cancel Meeting
Cancel a scheduled meeting.

**Endpoint**: `POST /calendar/:id/cancel`

---

## Interviews

### Start Interview
Begin a new interview session.

**Endpoint**: `POST /interviews/start`

**Request Body** (multipart/form-data):
- `resume`: PDF file
- `jobRole`: String (e.g., "Software Engineer")
- `difficulty`: String (easy|medium|hard)

**Response**:
```json
{
  "_id": "session_123",
  "jobRole": "Software Engineer",
  "resumeText": "Extracted resume text...",
  "status": "in-progress",
  "first_question": {
    "question": "Tell me about your experience with React.",
    "index": 1,
    "total": 5,
    "category": "technical"
  }
}
```

### Submit Response
Answer an interview question.

**Endpoint**: `POST /interviews/:id/respond`

**Request Body**:
```json
{
  "response": "I have 3 years of experience with React..."
}
```

**Response**:
```json
{
  "evaluation": {
    "score": 8,
    "feedback": "Good technical answer with specific examples",
    "strengths": ["Clear communication", "Relevant experience"],
    "improvements": ["Could add more depth on hooks"]
  },
  "next_question": {
    "question": "Describe a challenging project you worked on.",
    "index": 2,
    "total": 5
  }
}
```

### Complete Interview
End interview and get analytics.

**Endpoint**: `POST /interviews/:id/end`

**Response**:
```json
{
  "_id": "session_123",
  "status": "completed",
  "analysis": {
    "score": 78,
    "feedback": "Strong technical skills...",
    "skill_breakdown": {
      "technical": 80,
      "communication": 85,
      "problem_solving": 75,
      "domain_knowledge": 72
    },
    "areas_of_improvement": [
      "System design concepts",
      "Algorithm optimization"
    ],
    "recommended_resources": [
      "System Design Interview book",
      "LeetCode practice"
    ],
    "readiness_score": 78
  }
}
```

---

## Recommendations

### Get Recommendations
Fetch proactive AI suggestions.

**Endpoint**: `GET /recommendations`

**Response**:
```json
[
  {
    "_id": "rec_123",
    "type": "follow_up_email",
    "title": "Send follow-up for Team Meeting",
    "description": "Consider sending a follow-up email...",
    "priority": "medium",
    "aiReasoning": "Meeting ended 2 hours ago without follow-up",
    "suggestedAction": {
      "command": "Draft follow-up email to sarah@example.com",
      "parameters": { ... }
    },
    "status": "pending",
    "createdAt": "2026-01-13T12:00:00Z"
  }
]
```

### Dismiss Recommendation
Dismiss a suggestion.

**Endpoint**: `POST /recommendations/:id/dismiss`

### Execute Recommendation
Execute a suggested action.

**Endpoint**: `POST /recommendations/:id/execute`

**Response**:
```json
{
  "recommendation": { ... },
  "command": "Draft follow-up email to sarah@example.com"
}
```

---

## Activity Logs

### Get Activity Logs
Retrieve user activity history.

**Endpoint**: `GET /activity`

**Query Parameters**:
- `limit`: Number of logs (default: 50)
- `action`: Filter by action type
- `status`: Filter by status

**Response**:
```json
[
  {
    "_id": "log_123",
    "action": "email_sent",
    "description": "Sent email to john@example.com",
    "command": "Send email to john about project",
    "aiReasoning": "User requested email send",
    "confidence": 0.95,
    "status": "success",
    "executionTime": 1234,
    "timestamp": "2026-01-13T10:00:00Z"
  }
]
```

### Get Activity Stats
Get aggregated activity statistics.

**Endpoint**: `GET /activity/stats`

**Response**:
```json
[
  {
    "_id": "email_sent",
    "count": 15,
    "successCount": 14
  },
  {
    "_id": "meeting_scheduled",
    "count": 8,
    "successCount": 8
  }
]
```

---

## Error Responses

All endpoints may return these error codes:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### 502 Bad Gateway
```json
{
  "error": "Failed to communicate with AI Service"
}
```

---

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Burst**: 20 requests per second

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1673612400
```

---

## Webhooks (Future Feature)

Subscribe to events:
- `email.sent`
- `meeting.scheduled`
- `interview.completed`
- `recommendation.generated`

---

## Support

For API issues:
- Check status page: https://status.your-domain.com
- Contact: support@your-domain.com
- Documentation: https://docs.your-domain.com
