# Comprehensive Calls Management System - API Requirements

## Overview
This document outlines all API endpoints required to support the full-featured Calls page as specified in the exhaustive functional spec. The implementation covers blue-collar CRM functionality with advanced filtering, triage mode, SLA management, and comprehensive call handling.

## ✅ **COMPLETED ENDPOINTS**

### Core Calls Management
- ✅ `GET /api/calls` - Enhanced with comprehensive filtering (15+ query parameters)
- ✅ `GET /api/calls/:id` - Individual call details with relationships
- ✅ `PATCH /api/calls/:id` - Update call details and disposition
- ✅ `POST /api/calls/:id/link-contact` - Link/create contact (stub)
- ✅ `POST /api/calls/:id/new-contact` - Create new contact (stub)
- ✅ `POST /api/calls/:id/link-job` - Create and link job
- ✅ `PATCH /api/calls/:id/tags` - Update tags and notes

### Follow-up Management (SLA System)
- ✅ `GET /api/followups` - List follow-up tasks with filtering
- ✅ `POST /api/followups` - Create follow-up task
- ✅ `GET /api/followups/:id` - Individual follow-up task details
- ✅ `PATCH /api/followups/:id` - Update follow-up task
- ✅ `DELETE /api/followups/:id` - Delete follow-up task
- ✅ `POST /api/calls/:id/followups` - Create follow-up for specific call

---

## 🚧 **REQUIRED ENDPOINTS TO IMPLEMENT**

### 1. Telephony Integration
```
POST /api/calls/:id/click-to-call
Body: { bridgeMode?: 'conference' | 'transfer' }
Response: { callSid: string, status: 'dialing' | 'connected' | 'failed' }
Purpose: Initiate outbound call via telephony vendor

GET /api/calls/:id/call-status/:callSid
Response: { status: 'dialing' | 'ringing' | 'connected' | 'ended', duration?: number }
Purpose: Check live call status for UI updates
```

### 2. SMS and Messaging
```
POST /api/calls/:id/send-sms
Body: { 
  template: string,
  variables?: Record<string, string>,
  message?: string,
  scheduledFor?: string
}
Response: { messageSid: string, status: 'sent' | 'failed', cost?: number }
Purpose: Send SMS with templates and A2P compliance

GET /api/messaging/templates
Response: { templates: Template[] }
Purpose: List available SMS templates

GET /api/messaging/conversation/:number
Response: { messages: Message[], optInStatus: boolean }
Purpose: Two-way SMS conversation history

POST /api/messaging/opt-out/:number
Purpose: Handle STOP requests and DNC compliance
```

### 3. Bulk Operations
```
POST /api/calls/bulk
Body: {
  callIds: string[],
  operation: 'tag' | 'spam' | 'disposition' | 'followup' | 'export',
  data: any
}
Response: { jobId: string, affectedCount: number }
Purpose: Perform bulk operations on multiple calls

GET /api/bulk-jobs/:jobId
Response: { status: 'pending' | 'completed' | 'failed', progress: number }
Purpose: Track bulk operation progress
```

### 4. Export and Reporting
```
POST /api/calls/export
Body: { filters: CallsFilters, format: 'csv' | 'pdf', columns?: string[] }
Response: { jobId: string, estimatedTime: number }
Purpose: Start async export job

GET /api/exports/:jobId
Response: { status: 'processing' | 'ready' | 'failed', downloadUrl?: string }
Purpose: Check export status and get download link

GET /api/calls/:id/print
Response: PDF buffer
Purpose: Generate printable call card for field crews
```

### 5. Contact and DNC Management
```
GET /api/contacts/search?q=:query
Response: { contacts: Contact[] }
Purpose: Search contacts for linking

POST /api/contacts/:id/dnc
PATCH /api/contacts/:id/dnc
DELETE /api/contacts/:id/dnc
Purpose: Manage Do Not Contact status

GET /api/dnc/import
POST /api/dnc/import
Purpose: Import/export DNC lists for compliance

GET /api/blocked-numbers
POST /api/blocked-numbers
DELETE /api/blocked-numbers/:number
Purpose: Workspace-wide number blocking
```

### 6. Saved Views and Filters
```
GET /api/calls/views
Response: { userViews: SavedView[], teamViews: SavedView[] }
Purpose: List saved filter combinations

POST /api/calls/views
Body: { name: string, filters: CallsFilters, isTeamView: boolean }
Purpose: Save current filter state

PATCH /api/calls/views/:id
DELETE /api/calls/views/:id
Purpose: Update/delete saved views
```

### 7. File and Attachment Management
```
POST /api/calls/:id/attachments
Body: FormData with files
Response: { attachments: Attachment[] }
Purpose: Upload call-related files (photos, PDFs)

GET /api/attachments/:id
DELETE /api/attachments/:id
Purpose: Download/delete specific attachments

POST /api/calls/:id/photos
Purpose: Specialized photo upload with EXIF processing
```

### 8. Spam Detection and Management
```
POST /api/calls/:id/mark-spam
Body: { reason: 'robocall' | 'telemarketer' | 'repeat_silent', blockNumber?: boolean }
Purpose: Mark call as spam and optionally block number

GET /api/spam/reports
Purpose: Get spam statistics for workspace

POST /api/spam/train
Body: { callId: string, isSpam: boolean }
Purpose: Improve spam detection (if using ML)
```

### 9. Analytics and Metrics
```
GET /api/analytics/calls/overview
Query: from, to
Response: { 
  totalCalls: number,
  answeredPercent: number,
  avgDuration: number,
  conversionRate: number,
  slaCompliance: number
}
Purpose: Dashboard metrics

GET /api/analytics/calls/trends
Response: { daily: DataPoint[], hourly: DataPoint[] }
Purpose: Call volume trends and patterns

GET /api/analytics/agents/performance
Response: { agents: AgentMetrics[] }
Purpose: AI vs Human performance comparison
```

### 10. Real-time and Notifications
```
GET /api/notifications/follow-ups
Response: { overdueCount: number, dueSoonCount: number }
Purpose: SLA breach warnings

WebSocket: /ws/calls
Events: new_call, call_updated, follow_up_due, sla_breach
Purpose: Real-time updates for collaborative work

GET /api/calls/queue/triage
Response: { queuedCalls: Call[], priorities: Priority[] }
Purpose: Specialized endpoint for triage mode
```

### 11. Audit and Compliance
```
GET /api/audit/calls/:id
Response: { events: AuditEvent[] }
Purpose: Complete audit trail for call

POST /api/compliance/consent/:callId
Body: { recordingConsent: boolean, smsOptIn: boolean }
Purpose: Update consent status with audit trail

GET /api/compliance/report
Query: from, to, type: 'dnc' | 'recording' | 'a2p'
Response: Compliance report for regulatory requirements
```

### 12. Integration Webhooks
```
POST /api/webhooks/telephony
Body: Vendor-specific webhook payload
Purpose: Handle inbound webhooks from phone system

POST /api/webhooks/sms
Body: Vendor-specific SMS webhook payload  
Purpose: Handle inbound SMS and delivery receipts

POST /api/webhooks/transcription
Body: { callId: string, transcript: object }
Purpose: Receive transcripts from STT service
```

### 13. Settings and Configuration
```
GET /api/settings/sla-rules
POST /api/settings/sla-rules
Purpose: Configure SLA requirements per disposition

GET /api/settings/disposition-rules
POST /api/settings/disposition-rules  
Purpose: Configure required fields per outcome

GET /api/settings/business-hours
POST /api/settings/business-hours
Purpose: Define when calls are "after-hours"
```

---

## **AUTHENTICATION & MIDDLEWARE REQUIREMENTS**

### Role-Based Access Control
```
Viewer: Read-only access, no downloads
Tech: Limited to calls assigned to their jobs
Dispatcher: Full calls access, no admin functions
Admin: Full access including exports and settings
Owner: All permissions including DNC overrides
```

### Rate Limiting
- API calls: 1000 requests/hour per user
- Bulk operations: 5 concurrent jobs per workspace
- Exports: 10 exports/day per user
- SMS: Based on A2P campaign limits

### Webhooks Security
- Signature verification for all inbound webhooks
- IP allowlisting for telephony vendors
- Retry logic with exponential backoff

---

## **EXTERNAL SERVICE INTEGRATIONS**

### Required for Full Functionality
1. **Telephony Provider** (Twilio, RingCentral, etc.)
   - Voice calling capabilities
   - Call recording and storage
   - Real-time call status webhooks

2. **SMS Provider** (Twilio, Bandwidth, etc.)  
   - A2P campaign management
   - Two-way messaging
   - STOP/HELP compliance handling

3. **Speech-to-Text Service** (Google, AWS, Azure)
   - Real-time transcription
   - Confidence scoring
   - Speaker diarization

4. **File Storage** (S3, GCS, Azure Blob)
   - Call recordings storage
   - Attachment management  
   - Export file hosting

5. **Email Service** (SendGrid, AWS SES)
   - Export notifications
   - SLA breach alerts
   - Follow-up reminders

---

## **DEVELOPMENT PRIORITIES**

### Phase 1 (Critical - Prevents Basic Usage)
1. Click-to-call endpoints
2. SMS messaging with templates
3. Basic bulk operations (tag, spam)
4. Contact linking workflow

### Phase 2 (High Value - Enhances Workflow) 
1. Export functionality
2. Saved views system  
3. Attachment management
4. Advanced bulk operations

### Phase 3 (Professional Features)
1. Real-time notifications
2. Analytics endpoints
3. Audit trail API
4. Advanced spam management

### Phase 4 (Enterprise Features)
1. Compliance reporting
2. Advanced integrations
3. Custom webhooks
4. Advanced analytics

---

## **TESTING REQUIREMENTS**

### Unit Tests Required
- All endpoint parameter validation
- Role-based access control
- SLA calculation logic
- Bulk operation processing

### Integration Tests Required  
- Telephony provider integration
- SMS delivery and webhooks
- File upload/storage workflow
- Export generation pipeline

### Load Testing Scenarios
- 1000+ concurrent calls loading
- Bulk operations on 10,000+ calls
- Export generation under load
- Real-time WebSocket connections

This comprehensive API specification ensures the Calls page can deliver professional-grade call management for blue-collar businesses with enterprise-level features and compliance requirements.