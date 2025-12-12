# LMS Import/Export System

Comprehensive import/export system supporting all major LMS formats with HTML toggle options.

## Features

### Export Formats
- **SCORM 1.2** - Full package with manifest and content
- **SCORM 2004** - Advanced SCORM with sequencing
- **IMS Common Cartridge** - Industry standard course package
- **QTI 2.1/2.2** - Quiz and assessment export
- **xAPI (Tin Can)** - Learning analytics statements
- **JSON** - Custom format with full course data

### Import Formats
- **SCORM 1.2 & 2004** - Extract course structure, content, and quizzes
- **IMS Common Cartridge** - Full course import with assessments
- **QTI** - Import quizzes and assessments
- **JSON** - Import from custom format
- **Auto-detect** - Automatically detects format from package

### HTML Toggle
All export formats support HTML content toggle:
- `includeHTML=true` (default) - Preserves HTML formatting
- `stripHTML=true` - Converts HTML to plain text

## API Endpoints

### Export Course

#### Export in LMS Format
```
GET /api/export/course/:courseId/lms/:format
```

**Parameters:**
- `format`: `scorm12` | `scorm2004` | `imscc` | `qti` | `xapi`
- `includeHTML`: `true` | `false` (default: `true`)
- `stripHTML`: `true` | `false` (default: `false`)
- `includeQuizzes`: `true` | `false` (default: `true`)
- `includeVideos`: `true` | `false` (default: `true`)
- `includeMetadata`: `true` | `false` (default: `true`)

**Example:**
```bash
# Export as SCORM 1.2 with HTML
GET /api/export/course/abc123/lms/scorm12?includeHTML=true

# Export as IMS CC without HTML
GET /api/export/course/abc123/lms/imscc?stripHTML=true

# Export QTI quizzes only
GET /api/export/course/abc123/lms/qti?includeQuizzes=true
```

#### Export JSON with HTML Toggle
```
GET /api/export/course/:courseId/content.json?includeHTML=true
GET /api/export/course/:courseId/content.json?stripHTML=true
```

#### Export DOCX with HTML Toggle
```
GET /api/export/course/:courseId/content.docx?includeHTML=true
GET /api/export/course/:courseId/content.docx?stripHTML=true
```

### Import Course

#### Import from LMS Package
```
POST /api/import/course/lms/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: LMS package file (ZIP, XML, etc.)
- `format`: `scorm12` | `scorm2004` | `imscc` | `qti` | `json` | `auto` (optional, auto-detects if not provided)
- `extractQuizzes`: `true` | `false` (default: `true`)
- `extractAssessments`: `true` | `false` (default: `true`)
- `createUnits`: `true` | `false` (default: `true`)
- `overwriteExisting`: `true` | `false` (default: `false`)

**Response:**
```json
{
  "success": true,
  "courseId": "new-course-id",
  "unitsCreated": 5,
  "lessonsCreated": 15,
  "quizzesExtracted": 3,
  "assessmentsExtracted": 2,
  "errors": [],
  "warnings": []
}
```

## Usage Examples

### Export SCORM Package
```typescript
// Export with HTML formatting
const response = await fetch('/api/export/course/abc123/lms/scorm12?includeHTML=true');
const blob = await response.blob();
// Download as ZIP file
```

### Export Without HTML
```typescript
// Export as plain text
const response = await fetch('/api/export/course/abc123/lms/scorm12?stripHTML=true');
const blob = await response.blob();
```

### Import SCORM Package
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('format', 'scorm12');
formData.append('extractQuizzes', 'true');
formData.append('createUnits', 'true');

const response = await fetch('/api/import/course/lms/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Created ${result.unitsCreated} units, ${result.lessonsCreated} lessons`);
```

## What Gets Extracted

### From SCORM Packages
- Course metadata (title, description, hours)
- Unit/Module structure
- Lesson content (HTML or text)
- Quizzes and assessments (if present)
- Sequencing rules

### From IMS Common Cartridge
- Full course structure
- All content items
- Assessments and quizzes
- Discussion topics
- Web links

### From QTI
- Question banks
- Assessment items
- Multiple choice, multiple select, true/false
- Correct answers and feedback
- Scoring rules

## Implementation Notes

### HTML Processing
- When `includeHTML=true`: Content is exported with HTML tags preserved
- When `stripHTML=true`: HTML tags are removed, content converted to plain text
- Default behavior preserves HTML for better formatting

### Quiz Extraction
The import system intelligently extracts:
- Question text
- Answer choices
- Correct answers
- Point values
- Feedback (correct/incorrect)
- Question types (multiple choice, multiple select, etc.)

### Error Handling
- Invalid formats return clear error messages
- Partial imports report warnings for skipped items
- All errors are logged in the response

## File Structure

- `server/lmsImportExportService.ts` - Core import/export logic
- `server/storage.ts` - Updated export functions with HTML toggle
- `server/routes.ts` - API endpoints for import/export

## Future Enhancements

- [ ] Full SCORM sequencing support
- [ ] xAPI statement recording
- [ ] AICC import support
- [ ] Moodle backup import
- [ ] Canvas course export
- [ ] Blackboard package support

