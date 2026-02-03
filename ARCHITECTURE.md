# Russian Vocabulary Tracker v2.0 - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client-Side)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         HTML/CSS/JavaScript Application              │  │
│  │                                                       │  │
│  │  index.html (HTML Structure)                         │  │
│  │  ├── Sidebar Navigation                              │  │
│  │  ├── Dashboard Page                                  │  │
│  │  ├── Vocabulary Page                                 │  │
│  │  ├── Exports Page                                    │  │
│  │  └── Settings Page                                   │  │
│  │                                                       │  │
│  │  styles.css (Styling)                                │  │
│  │  ├── Color Variables (gradients)                     │  │
│  │  ├── Responsive Grid Layout                          │  │
│  │  ├── Card & Button Styles                            │  │
│  │  └── Animations & Transitions                        │  │
│  │                                                       │  │
│  │  script.js (Application Logic)                       │  │
│  │  ├── VocabTracker Class                              │  │
│  │  ├── CRUD Operations                                 │  │
│  │  ├── Export Functions                                │  │
│  │  ├── Import Functions                                │  │
│  │  ├── Error Handling                                  │  │
│  │  └── Storage Management                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Browser Storage & Cache Layer                │  │
│  │                                                       │  │
│  │  localStorage                                         │  │
│  │  ├── russianVocab (Main vocabulary array)            │  │
│  │  ├── russianVocabApiCache (Translation cache)        │  │
│  │  └── russianVocabExportHistory (Export tracking)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        ↓                                           ↑
   [Downloads]                                [Imports]
        ↓                                           ↑
┌─────────────────────────────────────────────────────────────┐
│                    USER FILE SYSTEM                          │
│                                                              │
│  ├── anki-vocab-review-2026-02-03.txt                       │
│  ├── quizlet-vocab-critical-2026-02-03.txt                  │
│  ├── json-backup-2026-02-03.json                            │
│  └── [User's Cloud Storage (optional)]                      │
│      ├── Google Drive                                       │
│      ├── Dropbox                                            │
│      └── OneDrive                                           │
└─────────────────────────────────────────────────────────────┘
        ↓                                           ↑
   [Manual Upload]                            [Download]
        ↓                                           ↑
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL PLATFORMS                         │
│                                                              │
│  ┌──────────────────┐     ┌──────────────────┐              │
│  │      Anki        │     │     Quizlet      │              │
│  │                  │     │                  │              │
│  │ Spaced Repeat    │     │ Interactive      │              │
│  │ Reviews          │     │ Study Sets       │              │
│  │                  │     │                  │              │
│  └──────────────────┘     └──────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Adding a Word
```
User Input
    ↓
[validateInputs()]
    ↓
[fetchWordData()] ← Check RUSSIAN_VERBS + Cache
    ↓
[createVocabEntry()]
    ↓
[vocabulary.push(entry)]
    ↓
[saveData()] → localStorage
    ↓
[updateDisplay()]
    ↓
[showNotification("Success!")]
    ↓
User Sees: Word Added + Statistics Updated
```

### Exporting to Anki
```
User Selects Category
    ↓
[getFilteredWords(category)]
    ↓
Format: Russian\tEnglish\tExample
    ↓
[createBlob(TSVContent)]
    ↓
[downloadFile(blob)]
    ↓
[recordExport()] → localStorage
    ↓
File Downloads: anki-vocab-[category]-[date].txt
    ↓
User Downloads File
    ↓
User Opens Anki
    ↓
File → Import → Select File
    ↓
Choose Deck → Import
    ↓
Words in Anki Ready for Review
```

### Searching & Filtering
```
User Enters Search Term
    ↓
[updateSearch()] triggered
    ↓
Combine: currentFilter + currentSearch
    ↓
[renderVocabulary()]
    ↓
Filter vocabulary array:
  ├── If category !== 'all': filter by category
  ├── If search !== '': filter by word/translation
  ├── Sort by date (newest first)
  └── Render matching items
    ↓
Display Results in Real-Time
```

### Importing Data
```
User Selects JSON File
    ↓
FileReader reads file
    ↓
[parseJSON(fileContent)]
    ↓
Validate: Is it an array?
    ↓
Merge Decision:
├─ Merge: Add new entries only (avoid duplicates)
└─ Replace: Clear all, use imported data
    ↓
[saveData()] → localStorage
    ↓
[updateDisplay()]
    ↓
[showNotification("Import successful!")]
    ↓
Vocabulary restored
```

## Component Interaction Map

```
┌──────────────────────────────────────────────────────────────┐
│                    VocabTracker Class                        │
│                    (Main Controller)                         │
└──────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
    ┌────────────┐   ┌──────────────┐  ┌──────────────────┐
    │   Data     │   │      UI      │  │    Storage       │
    │ Management │   │  Management  │  │   Management     │
    └────────────┘   └──────────────┘  └──────────────────┘
         ↓                    ↓                    ↓
    • addWord()          • goToPage()         • saveData()
    • editWord()         • renderVocab()      • loadData()
    • deleteWord()       • renderStats()      • saveCache()
    • getFiltered()      • updateDisplay()    • loadCache()
                         • showNotification() • saveExportHistory()

         ↓                    ↓                    ↓
    ┌──────────────────────────────────────────────────────────┐
    │              Export/Import Functions                     │
    ├──────────────────────────────────────────────────────────┤
    │ • exportToAnki()    - Format as TSV                     │
    │ • exportToQuizlet() - Format as term-definition         │
    │ • exportJSON()      - Complete backup                   │
    │ • importData()      - Merge or replace                  │
    │ • recordExport()    - Track exports                     │
    └──────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────┐
│         VocabTracker Instance           │
├─────────────────────────────────────────┤
│                                          │
│  vocabulary[]         Current words      │
│  exportHistory[]      Export tracking    │
│  apiCache{}           Translation cache  │
│                                          │
│  currentFilter        Active filter      │
│  currentSearch        Search string      │
│  currentPage          Active page        │
│                                          │
└─────────────────────────────────────────┘
           ↓        ↓        ↓
       ┌────────────────────────────┐
       │    Event Listeners         │
       ├────────────────────────────┤
       │ onClick   (buttons)        │
       │ onInput   (search)         │
       │ onKeypress (enter)         │
       │ onChange  (file upload)    │
       └────────────────────────────┘
           ↓        ↓        ↓
       ┌────────────────────────────┐
       │   Update State             │
       ├────────────────────────────┤
       │ Update arrays              │
       │ Update properties          │
       │ Save to localStorage       │
       │ Re-render UI               │
       └────────────────────────────┘
```

## Export Format Examples

### Anki Format (Tab-Separated)
```
слово	word	Example in sentence
говорить	to speak	Я говорю по-русски
читать	to read	Я читаю книгу
```

### Quizlet Format (Tab-Separated)
```
слово	word
говорить	to speak
читать	to read
```

### JSON Format
```json
[
  {
    "id": 1707xxx,
    "word": "слово",
    "translation": "word",
    "category": "review",
    "dateAdded": "2026-02-03",
    "isVerb": false,
    "examples": ["Example sentence"]
  },
  {
    "id": 1707xxx,
    "word": "говорить",
    "translation": "to speak",
    "category": "critical",
    "dateAdded": "2026-02-03",
    "isVerb": true,
    "conjugations": {
      "Я": "я говорю",
      "Ты": "ты говоришь",
      ...
    }
  }
]
```

## Error Handling Flow

```
User Action
    ↓
Try Block:
  Execute operation
    ↓
Success? ─ Yes → Complete Action
    ↓            ↓
    No      Update UI
    ↓       Show Success
Catch Block:  Notification
  ↓
Log Error
    ↓
Show Error Notification
    ↓
Allow User to Retry
```

## Performance Optimization

```
User Action
    ↓
Check Cache
├─ Found → Return instantly
└─ Not found → Continue
    ↓
Fetch/Calculate
    ↓
Save to Cache
    ↓
Return Result
    ↓
Future Access: Same action → Cache hit
```

## Browser Storage Timeline

```
Session 1:
├─ App loads
├─ Creates VocabTracker instance
├─ Loads from localStorage
├─ Updates in memory
├─ Saves after each change
└─ Browser closes

  [Data persists in localStorage]

Session 2:
├─ App loads
├─ Loads from localStorage (data restored!)
├─ User sees all previous words
├─ Makes changes
└─ Saves updated data

  [Process repeats]
```

## Mobile Responsive Behavior

```
Desktop (1200px+)
├─ Sidebar visible
├─ Full layout
└─ All features visible

Tablet (768px-1199px)
├─ Sidebar toggleable
├─ Adjusted layout
└─ Touch-optimized

Mobile (<768px)
├─ Sidebar off-screen
├─ Fullscreen content
├─ Large touch targets
└─ Stacked layout
```

## Deployment Architecture

```
Developer Computer
        ↓
    [Files]
        ↓
Deploy Options:
├─ GitHub Pages
│  └─ Push to repo
│     └─ Auto-deploy
│
├─ Netlify
│  └─ Drag & drop
│     └─ Auto-deploy
│
├─ Self-hosted
│  └─ SCP to server
│     └─ Manual
│
└─ Local Only
   └─ Open directly
      └─ No deployment
```

---

This architecture ensures:
- ✅ **Reliability**: Error handling at every step
- ✅ **Performance**: Caching and optimized operations
- ✅ **Scalability**: Can handle 1000+ words
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **User Experience**: Responsive and instant feedback
