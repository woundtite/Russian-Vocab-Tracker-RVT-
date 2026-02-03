# 🇷🇺 Russian Vocabulary Tracker v2.4

A modern, intelligent web-based application for tracking Russian vocabulary with **automatic word categorization**, **color-coded categories**, **smart auto-fill**, and powerful export capabilities to Anki and Quizlet.

**Latest Release**: v2.4 with Smart Categorization | **Status**: ✅ Production Ready

## ✨ Key Features

### 📊 Dashboard
- **Smart Word Entry**: Auto-fills translations, categories appear instantly
- **Auto-Categorization**: Words automatically classified as Verb, Adjective, Noun, or Adverb
- **Color Badges**: Beautiful gradient colors for each word type
- **Real-time Statistics**: Track total words and breakdown by category
- **Smart Categories**: Organize using Review, Supplemental, Critical, and Lesson tags

### 📝 Vocabulary Management
- **Organized List View**: Browse all vocabulary with word type badges
- **Advanced Search**: Filter by category or search for specific words
- **Smart Conjugations**: 20+ common Russian verbs with professional conjugation modals
- **Example Sentences**: Automatic and manual example tracking
- **Edit & Delete**: Full word management capabilities
- **Word Type Tracking**: Each word tagged with its grammatical type

### 🎨 Smart Categorization (v2.4)
- **Auto-Detection**: Automatically classifies words into 4 types
  - 🔴 **Verbs** (Red) - with complete conjugations
  - 🔵 **Adjectives** (Teal) - descriptive words
  - 🟡 **Nouns** (Gold) - things and people
  - 🟢 **Adverbs** (Mint) - modifying words
- **Color System**: Visual learning aid with beautiful gradients
- **Smart Modals**: Professional conjugation charts for verbs
- **Auto-Fill**: Translation fills automatically as you type

### 🌐 Auto-Translation (v2.2+)
- **Real-time Translation**: Words automatically translated via MyMemory API
- **Debounced Requests**: Smart 500ms delay prevents API overuse
- **Russian Detection**: Only translates when Cyrillic text detected
- **Error Handling**: Graceful fallback if translation fails

### 📤 Export & Import
- **Anki Export**: Export vocabulary in standard Anki format (tab-separated, ready to import)
- **Quizlet Export**: Export vocabulary in Quizlet-compatible format
- **JSON Backup**: Complete vocabulary backups for data safety
- **Smart Import**: Merge or replace vocabulary from backup files
- **Export History**: Track all exports with timestamps and word counts

### ⚙️ Settings & Data
- **Storage Info**: View storage usage and vocabulary statistics
- **Data Management**: Secure data clearing options
- **Local Storage**: All data stays on your device (no cloud required)

## Modern Design

- **Sidebar Navigation**: Clean, modern navigation interface
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Color System**: 4-color category system (Red/Teal/Gold/Mint)
- **Gradient Accents**: Professional color scheme with smooth transitions
- **Card-Based UI**: Organized information architecture
- **Dark Header**: Elegant gradient backgrounds
- **Smooth Animations**: Polished user experience

## Version Highlights

### 🎯 What's New in v2.4
- ✅ **Automatic Word Type Detection**: AI-powered classification
- ✅ **Color-Coded Badges**: Beautiful visual learning system
- ✅ **Smart Auto-Fill**: Translation fills automatically
- ✅ **Conjugation Modals**: Professional verb conjugation charts
- ✅ **Enhanced UI**: Smoother animations and interactions

### 📚 Previous Versions
- **v2.2**: Auto-translation with MyMemory API
- **v2.0**: Complete UI redesign with sidebar navigation
- **v1.0**: Basic vocabulary tracker

## How to Use

### 1. Getting Started
- Open `index.html` in any modern web browser
- No installation or setup required
- Server runs on localhost:8000 for development

### 2. Adding Vocabulary (v2.4)
1. Go to Dashboard
2. Enter Russian word in the form
3. **Translation auto-fills automatically** ✓
4. **Color category badge appears** ✓
5. (Optional) Add example sentence
6. Select category from dropdown
7. Click "Add Word"

### 3. Understanding Categories
- 🔴 **Red Badge** = Verb (action word)
  - Click "Show Conjugations" to see all 6 forms
  - Perfect for mastering verb conjugations

- 🔵 **Teal Badge** = Adjective (descriptive word)
  - Use for building descriptive vocabulary
  - Practice descriptions and attributes

- 🟡 **Gold Badge** = Noun (thing/person/place)
  - Build object and concept vocabulary
  - Core vocabulary building

- 🟢 **Mint Badge** = Adverb (modifying word)
  - Learn how to modify verbs and adjectives
  - Master language nuance
5. Select a category
6. Click "Add Word"

### 3. Viewing Vocabulary
1. Click "Vocabulary" in the sidebar
2. Use filter buttons to view by category
3. Use search box to find specific words
4. Click "Show Conjugations" for verbs to see all forms

### 4. Exporting to Study Platforms

#### Export to Anki
1. Go to "Exports" section
2. Select category (or "All Words")
3. Click "Export to Anki"
4. In Anki: File → Import → Select downloaded file
5. Choose your target deck

#### Export to Quizlet
1. Go to "Exports" section
2. Select category (or "All Words")
3. Click "Export to Quizlet"
4. Visit https://quizlet.com
5. Create new study set → Import from file
6. Upload the downloaded file

#### JSON Backup
1. Go to "Exports" section
2. Click "Download JSON"
3. Keep backups of your vocabulary

### 5. Importing Data
1. Go to "Exports" section
2. Click "Choose File" under "Import & Restore"
3. Select a previously exported JSON file
4. Choose to merge or replace data

## Supported Verbs with Auto-Conjugations

The app includes built-in present tense conjugations for:
быть, говорить, пить, делать, идти, читать, писать, слышать, видеть, жить, любить, давать, брать, знать, работать, учить, приходить, ходить, понимать, просить

More verbs can be easily added to the database.

## File Structure

```
Russian-Vocab-Tracker/
├── index.html          # Application interface
├── styles.css          # Modern styling
├── script.js           # Application logic
└── README.md           # This file
```

## Data Storage

### Local Storage
- Vocabulary list stored in browser's Local Storage
- API cache for translations
- Export history tracking
- Persistent across browser sessions
- Device-specific (not synced)

### Backup Strategy
- Export vocabulary regularly as JSON
- Store backups in cloud storage (Google Drive, Dropbox, etc.)
- Import backups anytime to restore data

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Keyboard Shortcuts

- **Enter** in word field: Add word
- **Tab**: Navigate form fields
- **Click filters**: Quick category filtering

## Tips for Effective Learning

### Daily Routine
1. **Morning**: Review critical and lesson words
2. **Throughout day**: Add 3-5 new words
3. **Evening**: Export and backup your list

### Using Categories
- 📋 **Review**: Regular practice words
- 📚 **Supplemental**: Extended vocabulary
- ⭐ **Critical**: Essential high-priority words
- 📖 **Lesson**: Words from current lesson/unit

### Export Strategy
- Export weekly as backup
- Use Anki for spaced repetition learning
- Use Quizlet for collaborative studying
- Keep JSON backups for data safety

## Features in Action

### 1. Auto-Translations
- Type Russian word
- Leave translation blank
- App auto-detects and fills in common words

### 2. Verb Conjugations
- For detected verbs, full conjugation grid appears
- Shows all 6 personal pronouns
- Click to expand/collapse

### 3. Smart Exports
- Category-specific exports
- Properly formatted for each platform
- Automatic filename with date and category

### 4. Export Tracking
- See all recent exports
- Track what was exported when
- Monitor study set creation

## Troubleshooting

### Data Not Saving
- Check browser's Local Storage is enabled
- Try a different browser
- Clear cache and reload

### Can't Export to Anki/Quizlet
- Make sure browser allows downloads
- Check file browser for downloads
- Try downloading to different folder

### Words Disappeared
- Export as JSON to backup
- Use Import to restore from backup
- Check Local Storage in browser settings

## Error Handling & Reliability

The application includes:
- **Try-catch blocks**: All operations wrapped in error handling
- **User Feedback**: Clear notifications for all actions
- **Data Validation**: Input validation before processing
- **Graceful Degradation**: Works offline once data is cached
- **Auto-save**: Data saved after each operation

## Privacy & Security

- 🔒 All data stays on your device
- 🔒 No server uploads or tracking
- 🔒 No third-party services
- 🔒 Complete data control
- 🔒 Can use completely offline

## Future Enhancement Ideas

- Spaced repetition algorithm
- Pronunciation audio
- Multiple choice quizzes
- Progress tracking with charts
- Cloud sync capability
- Mobile app
- Flashcard mode
- Keyboard practice

---

**Master Russian with smart vocabulary learning!**

**Удачи в изучении русского языка! 🎓**
