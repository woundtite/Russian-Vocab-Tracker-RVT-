# Russian Vocabulary Tracker v2.0 - Technical Overview

## Architecture

### Frontend
- **Single Page Application (SPA)** with vanilla JavaScript
- **Responsive Design** using CSS Grid and Flexbox
- **Modern UI Framework** with gradient accents and smooth transitions
- **No Dependencies** - pure JavaScript, HTML, and CSS

### Backend (Client-Side)
- **LocalStorage** for persistent data storage
- **JSON** for data serialization
- **In-Memory Cache** for API responses
- **Error Handling** with try-catch blocks and user feedback

## File Organization

```
/Russian-Vocab-Tracker/
├── index.html           # Main application page (14 KB)
├── styles.css           # Modern styling system (12 KB)
├── script.js            # Application logic (35 KB)
├── README.md            # Main documentation
├── EXPORT_GUIDE.md      # Export functionality guide
└── TECHNICAL.md         # This file
```

## Core Components

### 1. VocabTracker Class
Main application controller managing:
- Vocabulary data (CRUD operations)
- Navigation and page management
- Export/Import functionality
- Error handling and notifications
- Storage operations

### 2. Data Models

#### Vocabulary Entry
```javascript
{
  id: Number,                    // Unique timestamp-based ID
  word: String,                  // Russian word
  translation: String,           // English translation
  sentence: String|null,         // User's example sentence
  category: String,              // review|supplemental|critical|lesson
  dateAdded: String,             // ISO date format (YYYY-MM-DD)
  lastReviewed: String|null,     // ISO date format
  examples: Array<String>,       // Auto-fetched examples
  isVerb: Boolean,              // Detected verb flag
  conjugations: Object|null      // Present tense conjugations
}
```

#### Export Record
```javascript
{
  id: Number,                    // Timestamp
  platform: String,              // Anki|Quizlet|JSON Backup
  category: String,              // Category exported
  count: Number,                 // Words exported
  timestamp: String              // Human-readable timestamp
}
```

### 3. Storage Management

#### localStorage Keys
- `russianVocab` - Main vocabulary array
- `russianVocabApiCache` - Translation cache
- `russianVocabExportHistory` - Export tracking

#### Storage Limits
- Typical quota: 5-10 MB per domain
- Current app uses: ~50-200 KB (100 words)
- Scales well to 500+ words

### 4. Export Formats

#### Anki Format (TSV)
```
word<TAB>translation<TAB>example
слово<TAB>word<TAB>example sentence
```

#### Quizlet Format (TSV)
```
word<TAB>translation
слово<TAB>word
```

#### JSON Format
Complete vocabulary array with all metadata preserved

## Key Features Implementation

### Navigation System
- Event-driven page switching
- Active state management
- Smooth page transitions
- URL-independent (no routing needed)

### Search & Filter
- Real-time filtering with 'input' events
- Case-insensitive matching
- Combines category + search filters
- Instant results (no debouncing needed)

### Export Functionality

**Anki Export**
- Filters vocabulary by category
- Formats as tab-separated values
- Preserves special characters
- Triggers browser download
- Records export history

**Quizlet Export**
- Exports term-definition pairs
- Standard TSV format
- Compatible with Quizlet importer
- Records export history

**JSON Export**
- Serializes entire vocabulary
- Preserves all metadata
- Auto-dated filename
- Allows complete restore

### Import Functionality
- FileReader API for file handling
- JSON parsing with validation
- Merge or replace strategies
- Error recovery and user feedback
- Clear status messages

### Verb Conjugation Database
- 20+ common Russian verbs
- Present tense conjugations
- All 6 personal pronouns
- Auto-detected on word addition
- Expandable/collapsible display

## Error Handling Strategy

### Try-Catch Blocks
Wrap all risky operations:
- Storage operations (localStorage quota exceeded)
- File operations (import/export)
- JSON parsing (invalid files)
- DOM operations (missing elements)

### User Notifications
- Automatic notification system
- Type-based styling (success/error/info)
- Auto-dismiss after 3 seconds
- Top-right positioning
- Smooth animations

### Data Validation
- Check required fields before adding
- Validate category selection
- Verify file format on import
- Sanitize HTML output (XSS prevention)

## Performance Optimizations

### Storage Efficiency
- Compress timestamps to ISO strings
- No redundant data duplication
- Clean cache periodically
- Only last 10 exports retained

### UI Performance
- Event delegation where possible
- Minimal DOM manipulation
- Efficient re-rendering
- CSS animations (GPU accelerated)

### Search Performance
- O(n) linear search (acceptable for <1000 items)
- No indexing needed at this scale
- Instant filter updates
- Case-insensitive with .toLowerCase()

## Security Considerations

### XSS Prevention
- Use `textContent` where possible
- HTML escape user input with `textContent` → `innerHTML`
- DOMPurify not needed (no rich text)
- Safe to display user input as-is

### Data Privacy
- All processing client-side
- No external API calls for core functionality
- No tracking or analytics
- No login or authentication needed

### Backup Security
- JSON files are plain text
- No encryption (users can add with cloud service)
- Recommend password-protected cloud storage
- Can be version-controlled (Git)

## Browser APIs Used

### Supported
- ✅ localStorage API
- ✅ FileReader API
- ✅ Blob API
- ✅ URL.createObjectURL
- ✅ addEventListener
- ✅ fetch (not used currently)
- ✅ setTimeout/setInterval

### Not Required
- ❌ IndexedDB (not needed at this scale)
- ❌ Service Workers (works offline anyway)
- ❌ WebSockets (no real-time sync)
- ❌ Web Workers (no heavy computation)

## Scalability

### Current Capacity
- Vocabulary: <1000 words (tested)
- Export history: 10 recent exports (capped)
- API cache: All fetched words
- Storage: ~50 KB per 100 words

### Future Improvements
- Implement IndexedDB for 10,000+ words
- Add full-text search with trie structure
- Implement server sync
- Add user authentication
- Cloud backup integration

## Testing Recommendations

### Unit Tests (JavaScript)
```javascript
// Test data model
// Test search/filter logic
// Test export formatting
// Test import parsing
```

### Integration Tests
```javascript
// Test add/edit/delete workflow
// Test export and import round-trip
// Test filter combinations
// Test navigation
```

### User Acceptance Testing
```javascript
// Add 100+ words
// Export to each platform
// Import and verify
// Test on mobile
// Test cross-browser
```

## Deployment

### Simple Deployment
1. Copy all 4 files to web server
2. Serve as static content
3. No backend server needed
4. Works on GitHub Pages, Netlify, etc.

### Basic Python Server
```bash
# Serve locally for testing
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Nginx Configuration
```nginx
location /vocab {
  root /var/www;
  try_files $uri $uri/ =404;
  add_header Cache-Control "max-age=31536000";
}
```

## Dependencies & Alternatives

### Current: Zero Dependencies ✅
- Pure JavaScript (ES6+)
- Works in any browser

### If Adding Later
- **Storage**: Firebase (cloud sync)
- **Database**: MongoDB Atlas (scaling)
- **API**: Node.js Express (backend)
- **UI Framework**: React/Vue (larger app)
- **Audio**: Web Audio API (pronunciation)

## Maintenance & Updates

### Verb Database Maintenance
Located in `RUSSIAN_VERBS` object:
- Add conjugations to existing verbs
- Add new verbs following same structure
- No migration needed (data-driven)

### UI Updates
- Modify CSS variables for colors
- Update sidebar nav links
- Change button text in HTML
- No JavaScript changes needed

### Performance Monitoring
- Check localStorage usage
- Monitor export history growth
- Track error rates in console
- Test with slow networks

## Version History

### v2.0 (Current)
- ✅ Complete redesign with sidebar nav
- ✅ Modern gradient UI
- ✅ Anki export functionality
- ✅ Quizlet export functionality
- ✅ Export history tracking
- ✅ Improved error handling
- ✅ Settings & about pages

### v1.0
- Basic vocabulary tracking
- JSON backup/restore
- Search and filter
- Simple responsive design

## Support & Documentation

### User Documentation
- **README.md** - Getting started guide
- **EXPORT_GUIDE.md** - Export functionality detailed guide
- **TECHNICAL.md** - This technical reference

### Code Comments
- Inline comments for complex logic
- JSDoc-style comments for major functions
- Clear variable names
- Modular function organization

---

**For questions or issues, refer to README.md or EXPORT_GUIDE.md**
