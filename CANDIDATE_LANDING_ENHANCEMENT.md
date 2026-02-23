# Candidate Landing Page Enhancement Plan

**Created:** February 22, 2026
**Status:** Planning Phase
**Related:** ENHANCEMENT_PLAN.md Phase 2 & 3

---

## Overview

Enhance the candidate landing page to provide a better user experience for both new and returning applicants, with capabilities to preview submitted forms, view uploaded documents, and edit/replace information.

---

## Current State Analysis

### Existing Flow
1. User visits home page → Clicks "Apply Now"
2. Fills out FormView (all 17 fields at once)
3. Submits form → Gets form number
4. Upload admission letter dialog
5. Upload passport photo dialog
6. See LastPage confirmation with form number

### Current Limitations
- No way to return to an existing application
- No preview before submission
- No ability to edit after submission
- No document preview/verification
- No form validation feedback until submission
- Long single-page form (can be overwhelming)

---

## Proposed Enhancements

### 1. New Candidate Experience

#### Landing Page Options
```
┌─────────────────────────────────────────┐
│  ASA-SC Scholarship Application 2026    │
├─────────────────────────────────────────┤
│                                         │
│  [  Start New Application  ]            │
│                                         │
│  [  Continue Existing Application  ]    │
│                                         │
│  Already have a form number?            │
│  Enter it above to view/edit            │
└─────────────────────────────────────────┘
```

#### New Application Flow
```
Landing Page
    ↓
Personal Information Section
    ↓
College Information Section
    ↓
Upload Documents (Inline)
    ↓
Preview Complete Application
    ↓
Submit
    ↓
Confirmation with Form Number + Email
```

---

### 2. Returning Candidate Experience

#### Access Methods
1. **Form Number Entry**: Direct input on landing page
2. **Email Link**: From confirmation email sent after initial submission
3. **Browser Session**: Auto-load if recently submitted (30-day cookie)

#### Form Number Lookup Page
```typescript
// /Users/ranumba/projects/asa/src/components/FormLookup.tsx

interface FormLookupProps {}

export const FormLookup: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h3>Continue Your Application</h3>
          <p>Enter your form number to view or edit your application.</p>

          <form>
            <input
              type="text"
              placeholder="Enter Form Number (e.g., 699ABC123)"
              pattern="[A-Z0-9]{12}"
            />
            <button type="submit">Load Application</button>
          </form>

          <small className="text-muted">
            Form number sent to your email after initial submission
          </small>
        </div>
      </div>
    </div>
  );
};
```

---

### 3. Preview Capability

#### Preview Page Features
- **Read-only display** of all form data in organized sections
- **Document thumbnails** with zoom capability
- **Edit buttons** for each section (Personal Info, College Info, Documents)
- **Submit button** (only enabled if all required fields valid)
- **Save Draft** button (optional - for future enhancement)

#### Component Structure
```typescript
// /Users/ranumba/projects/asa/src/components/ApplicationPreview.tsx

interface ApplicationPreviewProps {
  formNumber: string;
  data: ApplicationData;
  onEdit: (section: string) => void;
  onSubmit: () => void;
}

export const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  formNumber,
  data,
  onEdit,
  onSubmit
}) => {
  return (
    <div className="container mt-4">
      <h2>Application Preview - {formNumber}</h2>

      {/* Personal Information Section */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between">
          <h5>Personal Information</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onEdit('personal')}
          >
            Edit
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <strong>Name:</strong> {data.firstName} {data.middleName} {data.lastName}
            </div>
            <div className="col-md-4">
              <strong>Gender:</strong> {data.gender}
            </div>
            <div className="col-md-4">
              <strong>Age:</strong> {data.age}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <strong>Email:</strong> {data.email}
            </div>
            <div className="col-md-6">
              <strong>Phone:</strong> {data.phoneNumber}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12">
              <strong>Address:</strong> {data.address}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <strong>Home Town:</strong> {data.homeTown}
            </div>
            <div className="col-md-6">
              <strong>LGA:</strong> {data.lga}
            </div>
          </div>
        </div>
      </div>

      {/* College Information Section */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between">
          <h5>College Information</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onEdit('college')}
          >
            Edit
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <strong>College Name:</strong> {data.collegeName}
            </div>
            <div className="col-md-6">
              <strong>Student ID:</strong> {data.studentId}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12">
              <strong>College Address:</strong> {data.collegeAddress}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <strong>Major:</strong> {data.studentMajor}
            </div>
            <div className="col-md-6">
              <strong>Admission Date:</strong> {data.admissionDate}
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between">
          <h5>Documents</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onEdit('documents')}
          >
            Replace Documents
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Admission Letter</h6>
              {data.admissionLetter ? (
                <DocumentPreview
                  fileName={data.admissionLetter}
                  type="letter"
                  formNumber={formNumber}
                />
              ) : (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle"></i> Not uploaded
                </div>
              )}
            </div>
            <div className="col-md-6">
              <h6>Passport Photo</h6>
              {data.passport ? (
                <DocumentPreview
                  fileName={data.passport}
                  type="passport"
                  formNumber={formNumber}
                />
              ) : (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle"></i> Not uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile/Statement */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between">
          <h5>Personal Statement</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onEdit('profile')}
          >
            Edit
          </button>
        </div>
        <div className="card-body">
          <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
            {data.profile}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-4">
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          Go Back
        </button>
        <button
          className="btn btn-success btn-lg"
          onClick={onSubmit}
          disabled={!isComplete(data)}
        >
          {data.timeStamp ? 'Update Application' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
};
```

#### Document Preview Component
```typescript
// /Users/ranumba/projects/asa/src/components/DocumentPreview.tsx

interface DocumentPreviewProps {
  fileName: string;
  type: 'letter' | 'passport';
  formNumber: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileName,
  type,
  formNumber
}) => {
  const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
  const folder = type === 'passport' ? 'passports' : 'images';
  const fileUrl = `${baseName}server/${folder}/${fileName}`;

  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const isPDF = fileExt === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '');

  return (
    <div className="document-preview">
      {isImage && (
        <div className="text-center">
          <img
            src={fileUrl}
            alt={type}
            className="img-thumbnail"
            style={{ maxWidth: '100%', maxHeight: '300px', cursor: 'pointer' }}
            onClick={() => window.open(fileUrl, '_blank')}
          />
          <div className="mt-2">
            <small className="text-muted">{fileName}</small>
            <br />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary mt-1"
            >
              <i className="bi bi-zoom-in"></i> View Full Size
            </a>
          </div>
        </div>
      )}

      {isPDF && (
        <div className="text-center">
          <div className="pdf-icon mb-2">
            <i className="bi bi-file-pdf" style={{ fontSize: '4rem', color: '#dc3545' }}></i>
          </div>
          <div>
            <small className="text-muted">{fileName}</small>
            <br />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary mt-1"
            >
              <i className="bi bi-eye"></i> View PDF
            </a>
          </div>
        </div>
      )}

      <div className="mt-2">
        <span className="badge bg-success">
          <i className="bi bi-check-circle"></i> Uploaded
        </span>
      </div>
    </div>
  );
};
```

---

### 4. Edit Capability

#### Edit Modes
1. **Edit Personal Information**: Returns to form with personal section editable
2. **Edit College Information**: Returns to form with college section editable
3. **Replace Documents**: Opens document upload modal
4. **Edit Profile**: Opens textarea editor for personal statement

#### Document Replacement Flow
```typescript
// /Users/ranumba/projects/asa/src/components/DocumentReplace.tsx

interface DocumentReplaceProps {
  formNumber: string;
  documentType: 'admissionLetter' | 'passport';
  currentFileName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DocumentReplace: React.FC<DocumentReplaceProps> = ({
  formNumber,
  documentType,
  currentFileName,
  onSuccess,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = documentType === 'admissionLetter'
      ? ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      : ['image/jpeg', 'image/jpg', 'image/png'];

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please select a valid file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError('File too large. Maximum size is 2MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('formNumber', formNumber);
    formData.append('uploadType', documentType === 'admissionLetter' ? 'letter' : 'passport');

    try {
      const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
      const response = await fetch(`${baseName}server/fileUpload.php`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.error === false) {
        onSuccess();
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Replace {documentType === 'admissionLetter' ? 'Admission Letter' : 'Passport Photo'}
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <div className="mb-3">
              <strong>Current file:</strong> <code>{currentFileName}</code>
            </div>

            <div className="mb-3">
              <label className="form-label">Select new file</label>
              <input
                type="file"
                className="form-control"
                accept={documentType === 'admissionLetter' ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png'}
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <small className="form-text text-muted">
                Max size: 2MB.
                {documentType === 'admissionLetter'
                  ? ' Accepted: PDF, JPG, PNG'
                  : ' Accepted: JPG, PNG'}
              </small>
            </div>

            {selectedFile && (
              <div className="alert alert-info">
                <i className="bi bi-file-earmark"></i> {selectedFile.name}
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                'Upload & Replace'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Updated Application Flow

### New User Journey
```
1. Landing Page
   ↓
   [Start New Application]
   ↓
2. Personal Information Form
   ↓
   [Continue to College Info]
   ↓
3. College Information Form
   ↓
   [Continue to Documents]
   ↓
4. Document Upload (Inline)
   - Upload Admission Letter
   - Upload Passport Photo
   ↓
   [Continue to Preview]
   ↓
5. Preview Application
   - View all data
   - View documents
   - Edit buttons for each section
   ↓
   [Submit Application]
   ↓
6. Confirmation Page
   - Form number displayed
   - Confirmation email sent
   - Link to edit application
```

### Returning User Journey
```
1. Landing Page
   ↓
   [Continue Existing Application]
   ↓
2. Form Number Entry
   ↓
   [Load Application]
   ↓
3. Preview Application (with edit buttons)
   ↓
   Options:
   - Edit Personal Info → Returns to form with that section
   - Edit College Info → Returns to form with that section
   - Replace Documents → Document upload modal
   - Re-submit if changes made
```

---

## Backend API Requirements

### New Endpoints Needed

#### 1. Get Application by Form Number
```php
// GET /api/applications/{formNumber}
// Returns full application data including document filenames

{
  "success": true,
  "data": {
    "formNumber": "699ABC123",
    "firstName": "John",
    "middleName": "Paul",
    "lastName": "Doe",
    // ... all other fields
    "admissionLetter": "699ABC123_admission.pdf",
    "passport": "699ABC123_photo.jpg",
    "timeStamp": "2026-02-15 10:30:00"
  }
}
```

**Note:** This endpoint already exists! In `/Users/ranumba/projects/asa/src/server/api/applications.php`

#### 2. Update Application
```php
// PUT /api/applications/{formNumber}
// Updates existing application data

Request Body:
{
  "firstName": "John",
  "email": "john@example.com",
  // ... fields to update
}

Response:
{
  "success": true,
  "message": "Application updated successfully"
}
```

**Note:** This endpoint already exists! Just needs to be utilized by frontend.

#### 3. Document Access Control (Optional Enhancement)
Currently documents are publicly accessible via direct URL. Consider adding:
```php
// GET /api/documents/{formNumber}/{type}
// type = 'letter' or 'passport'
// Validates form number exists before serving file

// For future: Add token-based access
```

---

## Frontend Routing Updates

### Updated Routes in App.tsx
```typescript
// /Users/ranumba/projects/asa/src/App.tsx

<Switch>
  {/* Public routes */}
  <Route exact path="/" component={InitialPage} />
  <Route exact path="/apply" component={FormLookup} />
  <Route exact path="/form/new" component={FormView} />
  <Route exact path="/form/:formNumber" component={FormView} />
  <Route exact path="/preview/:formNumber" component={ApplicationPreview} />
  <Route exact path="/confirmation/:formNumber" component={LastPage} />
  <Route exact path="/closedPage" component={ClosedPage} />
  <Route exact path="/openingPage" component={OpeningPage} />

  {/* Admin routes */}
  <Route exact path="/admin/login" component={AdminLogin} />
  <Route exact path="/admin/dashboard" component={AdminDashboard} />

  <Redirect to="/" />
</Switch>
```

---

## Updated Components

### 1. InitialPage Enhancement
```typescript
// /Users/ranumba/projects/asa/src/components/InitialPage.tsx

export const InitialPage: React.FC = () => {
  const history = useHistory();
  const [formNumber, setFormNumber] = useState('');
  const [showLookup, setShowLookup] = useState(false);

  const handleNewApplication = () => {
    history.push('/form/new');
  };

  const handleLookupApplication = async () => {
    if (!formNumber.trim()) {
      alert('Please enter a form number');
      return;
    }

    // Validate form number exists
    try {
      const response = await fetchWithoutToken(`/applications/${formNumber}`);
      if (response && response.success) {
        history.push(`/preview/${formNumber}`);
      } else {
        alert('Form number not found. Please check and try again.');
      }
    } catch (err) {
      alert('Error loading application. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1>ASA-SC Scholarship Application</h1>
        <p className="lead">Academic Session 2026</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              {!showLookup ? (
                <>
                  <button
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={handleNewApplication}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Start New Application
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-lg w-100"
                    onClick={() => setShowLookup(true)}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Continue Existing Application
                  </button>
                </>
              ) : (
                <>
                  <h5 className="mb-3">Continue Your Application</h5>
                  <div className="mb-3">
                    <label className="form-label">Enter Form Number</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="e.g., 699ABC123"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value.toUpperCase())}
                      maxLength={12}
                    />
                    <small className="form-text text-muted">
                      Your form number was sent to your email after submission
                    </small>
                  </div>
                  <button
                    className="btn btn-primary w-100 mb-2"
                    onClick={handleLookupApplication}
                  >
                    Load Application
                  </button>
                  <button
                    className="btn btn-link w-100"
                    onClick={() => setShowLookup(false)}
                  >
                    Back to options
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <small className="text-muted">
              Need help? Contact support at scholarship@asa-sc.org
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. FormView Updates
```typescript
// /Users/ranumba/projects/asa/src/components/FormView.tsx

// Add mode detection
const { formNumber } = useParams<{ formNumber?: string }>();
const isEditMode = formNumber !== 'new';

// Load existing data if edit mode
useEffect(() => {
  if (isEditMode && formNumber) {
    loadExistingApplication(formNumber);
  }
}, [formNumber]);

const loadExistingApplication = async (formNumber: string) => {
  try {
    const response = await fetchWithoutToken(`/applications/${formNumber}`);
    if (response && response.success) {
      // Pre-fill form with existing data
      setFormData(response.data);
    }
  } catch (err) {
    console.error('Failed to load application:', err);
  }
};

// Update submit behavior
const handleSubmit = async () => {
  if (isEditMode) {
    // PUT request to update
    await fetchWithoutToken(`/applications/${formNumber}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
  } else {
    // POST request to create
    await fetchWithoutToken('/applications', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  // Navigate to preview
  history.push(`/preview/${formNumber || newFormNumber}`);
};
```

---

## Email Enhancements

### Confirmation Email with Edit Link
```php
// /Applications/MAMP/htdocs/asa-aswa/server/lastPage.php

function sendConfirmationEmail($email, $formNumber, $firstName) {
    $editLink = "http://yoursite.com/asa-aswa/#/preview/$formNumber";

    $subject = "ASA-SC Scholarship Application Confirmation - $formNumber";

    $message = "
    <html>
    <body>
        <h2>Application Submitted Successfully</h2>
        <p>Dear $firstName,</p>
        <p>Thank you for submitting your scholarship application.</p>

        <p><strong>Your Form Number:</strong> <code>$formNumber</code></p>

        <p>Please keep this form number safe. You can use it to:</p>
        <ul>
            <li>View your submitted application</li>
            <li>Update your information</li>
            <li>Replace uploaded documents</li>
        </ul>

        <p>
            <a href='$editLink' style='display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;'>
                View/Edit Your Application
            </a>
        </p>

        <p>If you need to make changes, simply click the link above or visit our website and enter your form number.</p>

        <p>Best regards,<br>ASA-SC Scholarship Committee</p>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: noreply@asa-sc.org" . "\r\n";

    mail($email, $subject, $message, $headers);
}
```

---

## Implementation Checklist

### Phase 1: Preview Functionality (Week 1)
- [ ] Create `ApplicationPreview.tsx` component
- [ ] Create `DocumentPreview.tsx` component
- [ ] Add route `/preview/:formNumber`
- [ ] Update FormView to navigate to preview after submission
- [ ] Test preview with existing applications

### Phase 2: Edit Capability (Week 1-2)
- [ ] Add edit mode detection to FormView (check URL param)
- [ ] Implement form data loading for existing applications
- [ ] Update submit logic to handle PUT vs POST
- [ ] Create `DocumentReplace.tsx` modal component
- [ ] Add replace document functionality
- [ ] Test edit flow end-to-end

### Phase 3: Landing Page Enhancement (Week 2)
- [ ] Update `InitialPage.tsx` with new/continue options
- [ ] Create `FormLookup.tsx` component (or integrate into InitialPage)
- [ ] Add form number validation API call
- [ ] Update routing to handle `/form/new` vs `/form/:formNumber`
- [ ] Test landing page flow for both new and returning users

### Phase 4: Email & UX Polish (Week 2)
- [ ] Update confirmation email with edit link
- [ ] Add "Recently submitted" auto-load via cookie/localStorage
- [ ] Add confirmation dialogs for document replacement
- [ ] Add loading states and error handling
- [ ] Test complete user journey

---

## Testing Scenarios

### New User Flow
1. Visit landing page → Click "Start New Application"
2. Fill form → Upload documents → See preview
3. Click Submit → See confirmation with form number
4. Receive email with edit link

### Returning User Flow
1. Visit landing page → Click "Continue Existing"
2. Enter form number → Load preview
3. Click "Edit Personal Info" → Update fields → Save
4. Click "Replace Admission Letter" → Upload new file → Confirm
5. Review changes → Re-submit

### Edge Cases
- Invalid form number → Show error
- Form number for closed application period → Show message
- Document upload failure → Show retry option
- Network error during load → Show error with retry
- Missing documents → Highlight in preview
- Incomplete form → Disable submit

---

## Success Metrics

- **User Satisfaction**: 90%+ users find edit feature helpful
- **Form Completion Rate**: Increase from baseline to 90%+
- **Document Upload Success**: 98%+ success rate
- **Edit Usage**: 30%+ of users edit before final submission
- **Support Requests**: Reduce "how to edit" queries by 80%

---

## Future Enhancements (Post-MVP)

1. **Auto-save drafts** - Save progress every 30 seconds
2. **Multi-step wizard** - Break form into 3-4 steps with progress indicator
3. **Document verification** - AI-powered check for admission letter validity
4. **In-place editing** - Edit fields directly in preview without returning to form
5. **Version history** - Track all changes made to application
6. **Mobile app** - Native mobile experience
7. **Real-time validation** - Check duplicate emails/names during entry
8. **Richer previews** - PDF export of application preview

---

## Technical Notes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (Bootstrap 5)
- Touch-friendly upload controls

### Security Considerations
- Form numbers are not guessable (12 chars alphanumeric)
- No password required (form number acts as access key)
- Future: Add email verification for edits
- Future: Rate limit form number lookup attempts

### Performance
- Lazy load document previews
- Thumbnail generation for large images
- Compress images before upload (optional)
- Cache application data in memory

---

**Next Steps:** Review this plan and confirm priorities before implementation begins.
