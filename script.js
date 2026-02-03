// Translation API Utilities with Word Classification
const TranslationAPI = {
    // Adjective patterns (ending in -ый, -ой, -ий, -ая, -ое, -ее)
    adjectives: new Set([
        'хороший', 'плохой', 'большой', 'маленький', 'красивый', 'добрый',
        'злой', 'честный', 'глупый', 'умный', 'быстрый', 'медленный',
        'горячий', 'холодный', 'новый', 'старый', 'молодой', 'дорогой',
        'дешёвый', 'белый', 'чёрный', 'красный', 'синий', 'зелёный',
        'жёлтый', 'оранжевый', 'серый', 'розовый', 'коричневый', 'фиолетовый',
        'высокий', 'низкий', 'длинный', 'короткий', 'толстый', 'тонкий',
        'тёплый', 'светлый', 'тёмный', 'грязный', 'чистый', 'сильный',
        'слабый', 'смелый', 'трусливый', 'ленивый', 'трудолюбивый', 'богатый',
        'бедный', 'здоровый', 'больной', 'дикий', 'кроткий', 'весёлый',
        'грустный', 'скучный', 'интересный', 'скромный', 'гордый', 'удачный'
    ]),

    // Nouns are detected by elimination and common patterns
    // Will check if not a verb or adjective
    
    // Detect if text is Russian
    isRussian(text) {
        const russianRegex = /[а-яёА-ЯЁ]/;
        return russianRegex.test(text);
    },

    // Detect word category (part of speech) with confidence scoring
    detectCategory(word) {
        const lowerWord = word.toLowerCase();
        let confidence = 0;
        let result = null;
        
        // Check if it's a known verb (highest confidence)
        if (RUSSIAN_VERBS[lowerWord]) {
            return {
                category: 'Verb',
                type: 'verb',
                color: '#FF6B6B',
                confidence: 100
            };
        }

        // Check if it's an adjective (highest confidence)
        if (this.adjectives.has(lowerWord)) {
            return {
                category: 'Adjective',
                type: 'adjective',
                color: '#4ECDC4',
                confidence: 100
            };
        }

        // Check word endings for verb indicators (-ть, -ти) - high confidence
        if (lowerWord.endsWith('ть') || lowerWord.endsWith('ти')) {
            // Validate: check for common noun patterns that also end in -ти/-ть
            if (!lowerWord.endsWith('ности') && !lowerWord.endsWith('ность')) {
                return {
                    category: 'Verb',
                    type: 'verb',
                    color: '#FF6B6B',
                    confidence: 85
                };
            }
        }

        // Check word endings for adjective indicators
        if (lowerWord.endsWith('ый') || lowerWord.endsWith('ой') || 
            lowerWord.endsWith('ий') || lowerWord.endsWith('ая') ||
            lowerWord.endsWith('ое') || lowerWord.endsWith('ее') ||
            lowerWord.endsWith('ём') || lowerWord.endsWith('ём')) {
            return {
                category: 'Adjective',
                type: 'adjective',
                color: '#4ECDC4',
                confidence: 90
            };
        }

        // Check for adverb patterns (-о, -е, -и ending) - lower confidence
        // Need stricter validation to avoid false positives with nouns
        if (lowerWord.endsWith('о') || lowerWord.endsWith('е')) {
            // But not if it ends with typical noun endings
            if (!lowerWord.endsWith('ка') && !lowerWord.endsWith('ко') && 
                !lowerWord.endsWith('ние') && !lowerWord.endsWith('ца') &&
                !lowerWord.endsWith('ости') && !lowerWord.endsWith('ость')) {
                return {
                    category: 'Adverb',
                    type: 'adverb',
                    color: '#95E1D3',
                    confidence: 65
                };
            }
        }

        // Words ending in -и require careful validation
        // Many nouns end in -и (plural nominative), not just adverbs
        if (lowerWord.endsWith('и')) {
            // Check for noun plural patterns
            if (lowerWord.endsWith('ности') || lowerWord.endsWith('ости') || 
                lowerWord.endsWith('ации') || lowerWord.endsWith('жения') ||
                lowerWord.endsWith('ения') || lowerWord.endsWith('ении')) {
                // These are definitely nouns (plural or prepositional forms)
                return {
                    category: 'Noun',
                    type: 'noun',
                    color: '#FFD93D',
                    confidence: 95
                };
            }
            // For other -и endings, assume noun with medium confidence
            return {
                category: 'Noun',
                type: 'noun',
                color: '#FFD93D',
                confidence: 70
            };
        }

        // Default to Noun
        return {
            category: 'Noun',
            type: 'noun',
            color: '#FFD93D',
            confidence: 50
        };
    },

    // Validate category classification (double-check system)
    validateCategory(word, detectedCategory) {
        const lowerWord = word.toLowerCase();
        
        // Override check: if it looks like a plural noun ending, it's likely a noun
        if (detectedCategory.type === 'verb' || detectedCategory.type === 'adverb') {
            if (lowerWord.endsWith('ности') || lowerWord.endsWith('ости') || 
                lowerWord.endsWith('ации') || lowerWord.endsWith('жения') ||
                lowerWord.endsWith('ения')) {
                return {
                    category: 'Noun',
                    type: 'noun',
                    color: '#FFD93D',
                    confidence: 95,
                    overridden: true
                };
            }
        }
        
        // Return original if validation passes
        return detectedCategory;
    },

    // Uses MyMemory API (free, no authentication required)
    async translateWord(word) {
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ru|en`,
                { timeout: 5000 }
            );
            
            if (!response.ok) throw new Error('API error');
            
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                const translation = data.responseData.translatedText;
                let categoryInfo = this.detectCategory(word);
                
                // Apply double-check validation to prevent misclassifications
                categoryInfo = this.validateCategory(word, categoryInfo);
                
                // Return translation with metadata and category
                return {
                    word: word,
                    translation: translation,
                    category: categoryInfo.category,
                    categoryType: categoryInfo.type,
                    categoryColor: categoryInfo.color,
                    confidence: categoryInfo.confidence,
                    overridden: categoryInfo.overridden || false,
                    source: 'MyMemory API',
                    success: true
                };
            }
            return { success: false };
        } catch (error) {
            console.warn('Translation API error:', error);
            return { success: false };
        }
    },

    // Get synonyms using Wikipedia/Wiktionary
    async getSynonyms(word) {
        try {
            // Try to fetch from Wiktionary
            const response = await fetch(
                `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&format=json&origin=*`,
                { timeout: 5000 }
            );
            
            if (!response.ok) return [];
            
            const data = await response.json();
            
            // This gives us the page; real synonym extraction would need parsing
            // For now, return empty - focus on main translation
            return [];
        } catch (error) {
            console.warn('Synonyms fetch error:', error);
            return [];
        }
    },

    // Detect stress position in Russian word
    detectStress(word) {
        const lowerWord = word.toLowerCase();
        
        // Check if word is in stress database (most reliable)
        if (STRESS_DATABASE[lowerWord]) {
            return STRESS_DATABASE[lowerWord];
        }
        
        // Apply pattern-based rules if not in database
        for (const [ending, rule] of Object.entries(STRESS_RULES)) {
            if (lowerWord.endsWith(ending)) {
                if (rule.position === 'last') {
                    const syllables = this.syllabifyWord(lowerWord);
                    return Math.max(0, syllables.length - 1 - rule.offset);
                }
            }
        }
        
        // Default: first syllable if no match found
        return 0;
    },

    // Validate stress placement against known patterns
    validateStress(word, stressIndex) {
        const lowerWord = word.toLowerCase();
        const syllables = this.syllabifyWord(lowerWord);
        
        // Stress index must be within word bounds
        if (stressIndex < 0 || stressIndex >= syllables.length) {
            return {
                valid: false,
                confidence: 0,
                message: 'Stress position outside word boundaries'
            };
        }
        
        // Check against database if available
        const dbStress = STRESS_DATABASE[lowerWord];
        if (dbStress !== undefined) {
            return {
                valid: stressIndex === dbStress,
                confidence: 100,
                message: dbStress === stressIndex ? 'Correct stress' : `Expected stress on syllable ${dbStress + 1}`
            };
        }
        
        // Apply pattern validation
        for (const [ending, rule] of Object.entries(STRESS_RULES)) {
            if (lowerWord.endsWith(ending)) {
                if (rule.position === 'last') {
                    const expectedIndex = Math.max(0, syllables.length - 1 - rule.offset);
                    return {
                        valid: stressIndex === expectedIndex,
                        confidence: 85,
                        message: stressIndex === expectedIndex ? 'Correct stress' : `Pattern suggests stress on syllable ${expectedIndex + 1}`
                    };
                }
            }
        }
        
        // Default validation for unknown words
        return {
            valid: true,
            confidence: 40,
            message: 'Stress position accepted (low confidence)'
        };
    },

    // Simple syllabification for Russian words
    syllabifyWord(word) {
        // Vowels in Russian
        const vowels = 'aeiouyаеиоуыя';
        const syllables = [];
        let currentSyllable = '';
        
        for (let i = 0; i < word.length; i++) {
            currentSyllable += word[i];
            if (vowels.includes(word[i])) {
                syllables.push(currentSyllable);
                currentSyllable = '';
            }
        }
        
        if (currentSyllable) {
            if (syllables.length === 0) {
                syllables.push(currentSyllable);
            } else {
                syllables[syllables.length - 1] += currentSyllable;
            }
        }
        
        return syllables.length > 0 ? syllables : [word];
    },

    // Apply bold formatting to stressed syllable
    applyStressFormatting(word, stressIndex) {
        const syllables = this.syllabifyWord(word.toLowerCase());
        
        if (stressIndex < 0 || stressIndex >= syllables.length) {
            return word; // Return original if invalid
        }
        
        const result = [];
        let charIndex = 0;
        
        for (let i = 0; i < syllables.length; i++) {
            const syllable = syllables[i];
            if (i === stressIndex) {
                result.push(`<b>${word.substring(charIndex, charIndex + syllable.length)}</b>`);
            } else {
                result.push(word.substring(charIndex, charIndex + syllable.length));
            }
            charIndex += syllable.length;
        }
        
        return result.join('');
    }
};


// ==================== SYNONYM DATABASE (v2.41) ====================
const SYNONYMS = {
    // Adjectives
    'красивый': [
        { rus: 'прекрасный', eng: 'beautiful' },
        { rus: 'красивый', eng: 'handsome' },
        { rus: 'привлекательный', eng: 'attractive' }
    ],
    'большой': [
        { rus: 'большой', eng: 'big' },
        { rus: 'крупный', eng: 'large' },
        { rus: 'огромный', eng: 'huge' }
    ],
    'маленький': [
        { rus: 'маленький', eng: 'small' },
        { rus: 'крошечный', eng: 'tiny' },
        { rus: 'незначительный', eng: 'insignificant' }
    ],
    'хороший': [
        { rus: 'хороший', eng: 'good' },
        { rus: 'отличный', eng: 'excellent' },
        { rus: 'замечательный', eng: 'wonderful' }
    ],
    'плохой': [
        { rus: 'плохой', eng: 'bad' },
        { rus: 'ужасный', eng: 'terrible' },
        { rus: 'дурной', eng: 'evil' }
    ],
    'быстрый': [
        { rus: 'быстрый', eng: 'fast' },
        { rus: 'скорый', eng: 'swift' },
        { rus: 'торопливый', eng: 'hasty' }
    ],
    'медленный': [
        { rus: 'медленный', eng: 'slow' },
        { rus: 'неспешный', eng: 'unhurried' },
        { rus: 'плавный', eng: 'smooth' }
    ],
    'добрый': [
        { rus: 'добрый', eng: 'kind' },
        { rus: 'благодушный', eng: 'good-natured' },
        { rus: 'приветливый', eng: 'affable' }
    ],
    'умный': [
        { rus: 'умный', eng: 'smart' },
        { rus: 'разумный', eng: 'intelligent' },
        { rus: 'сообразительный', eng: 'clever' }
    ],
    'новый': [
        { rus: 'новый', eng: 'new' },
        { rus: 'свежий', eng: 'fresh' },
        { rus: 'современный', eng: 'modern' }
    ],
    'старый': [
        { rus: 'старый', eng: 'old' },
        { rus: 'древний', eng: 'ancient' },
        { rus: 'ветхий', eng: 'decrepit' }
    ],
    
    // Nouns
    'вода': [
        { rus: 'вода', eng: 'water' },
        { rus: 'жидкость', eng: 'liquid' },
        { rus: 'влага', eng: 'moisture' }
    ],
    'книга': [
        { rus: 'книга', eng: 'book' },
        { rus: 'том', eng: 'tome' },
        { rus: 'издание', eng: 'publication' }
    ],
    'школа': [
        { rus: 'школа', eng: 'school' },
        { rus: 'учреждение', eng: 'institution' },
        { rus: 'заведение', eng: 'establishment' }
    ],
    'работа': [
        { rus: 'работа', eng: 'work' },
        { rus: 'дело', eng: 'job' },
        { rus: 'занятие', eng: 'occupation' }
    ],
    'дом': [
        { rus: 'дом', eng: 'house' },
        { rus: 'жилище', eng: 'dwelling' },
        { rus: 'обитель', eng: 'residence' }
    ],
    'время': [
        { rus: 'время', eng: 'time' },
        { rus: 'эпоха', eng: 'era' },
        { rus: 'период', eng: 'period' }
    ],
    
    // Verbs (will be handled differently in modal)
    'читать': [
        { rus: 'читать', eng: 'to read' },
        { rus: 'изучать', eng: 'to study' },
        { rus: 'просматривать', eng: 'to scan' }
    ],
    'писать': [
        { rus: 'писать', eng: 'to write' },
        { rus: 'сочинять', eng: 'to compose' },
        { rus: 'набирать', eng: 'to type' }
    ],
    'говорить': [
        { rus: 'говорить', eng: 'to speak' },
        { rus: 'разговаривать', eng: 'to talk' },
        { rus: 'произносить', eng: 'to utter' }
    ],
    'делать': [
        { rus: 'делать', eng: 'to do' },
        { rus: 'производить', eng: 'to make' },
        { rus: 'создавать', eng: 'to create' }
    ]
};

// ==================== STRESS/ACCENT DATABASE ====================
// Stores stress position (syllable index, 0-based) for Russian words
// Format: word: syllableIndex (0 = first syllable, 1 = second, etc.)
const STRESS_DATABASE = {
    // Common nouns
    'мама': 0,
    'папа': 0,
    'книга': 0,
    'вода': 1,
    'школа': 0,
    'работа': 0,
    'дом': 0,
    'время': 0,
    'люди': 0,
    'слово': 0,
    'голос': 0,
    'рука': 1,
    'нога': 1,
    'голова': 2,
    'лицо': 0,
    'сердце': 0,
    'глаз': 0,
    'ухо': 0,
    'нос': 0,
    'рот': 0,
    'волос': 0,
    'зуб': 0,
    'палец': 0,
    'спина': 1,
    'животное': 2,
    'птица': 0,
    'рыба': 0,
    'цветок': 1,
    'дерево': 0,
    'трава': 1,
    'камень': 0,
    'песок': 1,
    'вещество': 2,
    'материал': 2,
    'город': 0,
    'улица': 0,
    'дорога': 1,
    'река': 1,
    'озеро': 1,
    'море': 0,
    'гора': 1,
    'долина': 2,
    'лес': 0,
    'поле': 0,
    'таблица': 0,
    'карта': 0,
    'компас': 0,
    'картина': 2,
    'музыка': 0,
    'песня': 0,
    'танец': 0,
    'игра': 1,
    'спорт': 0,
    'война': 1,
    'мир': 0,
    'страна': 1,
    'край': 0,
    'район': 1,
    'область': 0,
    'человек': 0,
    'женщина': 0,
    'мужчина': 0,
    'ребенок': 1,
    'дитя': 0,
    'девочка': 0,
    'мальчик': 0,
    'кошка': 0,
    'собака': 1,
    'лошадь': 0,
    'корова': 1,
    'яйцо': 1,
    'хлеб': 0,
    'масло': 0,
    'сахар': 0,
    'соль': 0,
    'мясо': 0,
    'рыба': 0,
    'овощ': 0,
    'фрукт': 0,
    'яблоко': 0,
    'груша': 0,
    'апельсин': 2,
    'банан': 1,
    'виноград': 0,
    'клубника': 2,
    'малина': 2,
    'ягода': 0,
    'морковь': 1,
    'картофель': 0,
    'огурец': 1,
    'помидор': 2,
    'салат': 1,
    'суп': 0,
    'чай': 0,
    'кофе': 1,
    'молоко': 1,
    'сыр': 0,
    'йогурт': 1,
    'вино': 1,
    'пиво': 0,
    'водка': 0,
    'одежда': 1,
    'платье': 0,
    'рубашка': 1,
    'юбка': 0,
    'брюки': 0,
    'куртка': 0,
    'пальто': 1,
    'свитер': 1,
    'носок': 1,
    'башмак': 1,
    'туфля': 0,
    'сапог': 1,
    'шляпа': 0,
    'шапка': 0,
    'перчатка': 1,
    'шарф': 0,
    'галстук': 1,
    'сумка': 0,
    'портфель': 1,
    'часы': 0,
    'кольцо': 1,
    'серьги': 0,
    'браслет': 1,
    'ожерелье': 2,
    'монета': 1,
    'деньги': 0,
    'доход': 1,
    'расход': 1,
    'цена': 1,
    'стоимость': 0,
    'товар': 1,
    'качество': 0,
    'количество': 3,
    'номер': 0,
    'размер': 1,
    'вес': 0,
    'высота': 2,
    'ширина': 2,
    'длина': 1,
    'глубина': 2,
    'расстояние': 3,
    'температура': 3,
    'влажность': 0,
    'скорость': 0,
    'направление': 2,
    'угол': 0,
    'круг': 0,
    'квадрат': 1,
    'треугольник': 2,
    'прямоугольник': 3,
    'линия': 0,
    'точка': 0,
    'площадь': 0,
    'объем': 1,
    'плотность': 0,
    'давление': 1,
    'энергия': 1,
    'сила': 0,
    'мощность': 0,
    'частота': 1,
    'период': 1,
    'волна': 0,
    'звук': 0,
    'шум': 0,
    'молчание': 1,
    'свет': 0,
    'тень': 0,
    'цвет': 0,
    'яркость': 0,
    'блеск': 0,
    'запах': 0,
    'аромат': 1,
    'вкус': 0,
    'вкусный': 0,
    'горячий': 0,
    'холодный': 0,
    'теплый': 0,
    'мягкий': 0,
    'твердый': 0,
    'жесткий': 0,
    'гладкий': 0,
    'шероховатый': 2,
    'острый': 0,
    'тупой': 0,
    'толстый': 0,
    'тонкий': 0,
    'сладкий': 0,
    'соленый': 1,
    'горький': 0,
    'кислый': 0,
    'свежий': 0,
    'старый': 0,
    'новый': 0,
    'молодой': 1,
    'старый': 0,
    'взрослый': 1,
    'молодежь': 1,
    'пожилой': 1,
    'красивый': 1,
    'уродливый': 1,
    'милый': 0,
    'хороший': 0,
    'плохой': 0,
    'добрый': 0,
    'злой': 0,
    'честный': 0,
    'нечестный': 1,
    'верный': 0,
    'ложный': 0,
    'полезный': 1,
    'вредный': 0,
    'опасный': 1,
    'безопасный': 2,
    'чистый': 0,
    'грязный': 0,
    'аккуратный': 2,
    'неаккуратный': 3,
    'умный': 0,
    'глупый': 0,
    'смешной': 1,
    'трудный': 0,
    'легкий': 0,
    'простой': 1,
    'сложный': 1,
    'интересный': 2,
    'скучный': 0,
    'забавный': 1,
    'серьезный': 2,
    'шумный': 0,
    'тихий': 0,
    'громкий': 0,
    'спокойный': 1,
    'возбужденный': 2,
    'веселый': 0,
    'грустный': 0,
    'радостный': 1,
    'печальный': 1,
    'счастливый': 1,
    'несчастный': 2,
    'ненавистный': 2,
    'любимый': 1,
    'нелюбимый': 2,
    
    // Common verbs
    'быть': 0,
    'иметь': 1,
    'делать': 0,
    'говорить': 1,
    'давать': 0,
    'знать': 0,
    'брать': 0,
    'видеть': 0,
    'идти': 0,
    'читать': 1,
    'писать': 0,
    'слышать': 0,
    'жить': 0,
    'работать': 0,
    'учить': 0,
    'помнить': 0,
    'думать': 0,
    'любить': 0,
    'хотеть': 1,
    'мочь': 0,
    'должен': 0,
    'нужно': 0,
    'можно': 1,
    'нельзя': 1,
    'позволять': 2,
    'приходить': 1,
    'ходить': 0,
    'ездить': 0,
    'приезжать': 2,
    'уезжать': 1,
    'приносить': 2,
    'покупать': 1,
    'продавать': 1,
    'давать': 0,
    'получать': 2,
    'находить': 2,
    'терять': 0,
    'искать': 0,
    'ждать': 0,
    'звать': 0,
    'звонить': 1,
    'писать': 0,
    'понимать': 2,
    'начинать': 1,
    'кончать': 0,
    'оканчивать': 1,
    'продолжать': 2,
    'пытаться': 0,
    'стараться': 0,
    'желать': 1,
    'предпочитать': 2,
    'выбирать': 1,
    'решать': 0,
    'верить': 0,
    'надеяться': 0,
    'опасаться': 1,
    'бояться': 0,
    'стыдиться': 0,
    'радоваться': 1,
    'жалеть': 1,
    'благодарить': 2,
    'извинять': 1,
    'прощать': 1,
    'наказывать': 2,
    'награждать': 2,
    'учить': 0,
    'учиться': 1,
    'обучать': 2,
    'рассказывать': 2,
    'объяснять': 1,
    'описывать': 2,
    'чувствовать': 1,
    'ощущать': 2,
    'воспринимать': 2,
    'замечать': 1,
    'видеть': 0,
    'слышать': 0,
    'нюхать': 0,
    'пробовать': 1,
    'осязать': 0,
    'касаться': 0,
    'трогать': 0,
    'толкать': 0,
    'тянуть': 0,
    'пушить': 0,
    'носить': 0,
    'везти': 1,
    'нести': 0,
    'класть': 0,
    'ставить': 0,
    'вешать': 0,
    'вставать': 1,
    'садиться': 0,
    'ложиться': 0,
    'встанить': 1,
    'упасть': 1,
    'подняться': 1,
    'спуститься': 2,
    'прыгать': 0,
    'бежать': 1,
    'бежать': 1,
    'ходить': 0,
    'шагать': 1,
    'шутить': 1,
    'смеяться': 1,
    'плакать': 0,
    'кричать': 1,
    'кричать': 1,
    'петь': 0,
    'танцевать': 0,
    'летать': 1,
    'плыть': 0,
    'тонуть': 0,
    'готовить': 1,
    'варить': 0,
    'жарить': 0,
    'печь': 0,
    'резать': 0,
    'чистить': 0,
    'мыть': 0,
    'стирать': 0,
    'гладить': 0,
    'шить': 0,
    'вязать': 0,
    'открывать': 2,
    'закрывать': 1,
    'открыть': 1,
    'закрыть': 1,
    'запирать': 1,
    'отпирать': 1,
    'заключать': 1,
    'включать': 1,
    'выключать': 2,
    'включить': 1,
    'выключить': 2,
    'поворачивать': 2,
    'повернуть': 1,
    'кручить': 0,
    'скручивать': 1,
    'заворачивать': 2,
    'развертывать': 2,
    'развернуть': 1,
    'сворачивать': 1,
    'свернуть': 1,
    'складывать': 1,
    'сложить': 1,
    'разворачивать': 2,
    'разложить': 2,
    'укладывать': 1,
    'уложить': 1,
    'протягивать': 2,
    'протянуть': 1,
    'вытягивать': 2,
    'вытянуть': 1,
    'сгибать': 0,
    'согнуть': 0,
    'разгибать': 1,
    'разогнуть': 1,
    'раскрывать': 1,
    'раскрыть': 1,
    'разнимать': 1,
    'разнять': 1,
    'разнимать': 1,
    'расстегивать': 2,
    'расстегнуть': 2,
    'застегивать': 1,
    'застегнуть': 1,
    'расшнуровывать': 3,
    'расшнуровать': 3,
    'зашнуровывать': 2,
    'зашнуровать': 2,
};

// Stress validation rules for patterns
const STRESS_RULES = {
    // Words ending in -ость usually have stress on -ость
    'ость': { position: 'last', offset: 0 },
    // Words ending in -ение usually have stress on -ение
    'ение': { position: 'last', offset: 1 },
    // Words ending in -ак usually have stress on -ак
    'ак': { position: 'last', offset: 0 },
    // Words ending in -ик usually have stress on -ик
    'ик': { position: 'last', offset: 0 }
};

// Comprehensive Russian Verb Conjugation Database
const RUSSIAN_VERBS = {
    'быть': {
        infinitive: 'быть',
        meaning: 'to be',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я есть',
            'Ты': 'ты есть',
            'Он/Она/Оно': 'он/она/оно есть',
            'Мы': 'мы есть',
            'Вы': 'вы есть',
            'Они': 'они есть'
        },
        pastTense: {
            'Я (m)': 'я был',
            'Я (f)': 'я была',
            'Ты (m)': 'ты был',
            'Ты (f)': 'ты была',
            'Он': 'он был',
            'Она': 'она была',
            'Оно': 'оно было',
            'Мы (m/pl)': 'мы были',
            'Мы (f/pl)': 'мы были',
            'Вы': 'вы были',
            'Они': 'они были'
        }
    },
    'говорить': {
        infinitive: 'говорить',
        meaning: 'to speak',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я говорю',
            'Ты': 'ты говоришь',
            'Он/Она/Оно': 'он/она/оно говорит',
            'Мы': 'мы говорим',
            'Вы': 'вы говорите',
            'Они': 'они говорят'
        },
        pastTense: {
            'Я (m)': 'я говорил',
            'Я (f)': 'я говорила',
            'Ты (m)': 'ты говорил',
            'Ты (f)': 'ты говорила',
            'Он': 'он говорил',
            'Она': 'она говорила',
            'Оно': 'оно говорило',
            'Мы': 'мы говорили',
            'Вы': 'вы говорили',
            'Они': 'они говорили'
        }
    },
    'пить': {
        infinitive: 'пить',
        meaning: 'to drink',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я пью',
            'Ты': 'ты пьёшь',
            'Он/Она/Оно': 'он/она/оно пьёт',
            'Мы': 'мы пьём',
            'Вы': 'вы пьёте',
            'Они': 'они пьют'
        },
        pastTense: {
            'Я (m)': 'я пил',
            'Я (f)': 'я пила',
            'Ты (m)': 'ты пил',
            'Ты (f)': 'ты пила',
            'Он': 'он пил',
            'Она': 'она пила',
            'Оно': 'оно пило',
            'Мы': 'мы пили',
            'Вы': 'вы пили',
            'Они': 'они пили'
        },
        conjugations: { 'Я': 'я пью', 'Ты': 'ты пьёшь', 'Он/Она/Оно': 'он/она/оно пьёт', 'Мы': 'мы пьём', 'Вы': 'вы пьёте', 'Они': 'они пьют' }
    },
    'делать': {
        infinitive: 'делать',
        meaning: 'to do/make',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я делаю',
            'Ты': 'ты делаешь',
            'Он/Она/Оно': 'он/она/оно делает',
            'Мы': 'мы делаем',
            'Вы': 'вы делаете',
            'Они': 'они делают'
        },
        pastTense: {
            'Я (m)': 'я делал',
            'Я (f)': 'я делала',
            'Он': 'он делал',
            'Она': 'она делала',
            'Оно': 'оно делало',
            'Мы': 'мы делали',
            'Вы': 'вы делали',
            'Они': 'они делали'
        },
        conjugations: { 'Я': 'я делаю', 'Ты': 'ты делаешь', 'Он/Она/Оно': 'он/она/оно делает', 'Мы': 'мы делаем', 'Вы': 'вы делаете', 'Они': 'они делают' }
    },
    'идти': {
        infinitive: 'идти',
        meaning: 'to go (on foot)',
        aspect: 'imperfective',
        directionality: 'unidirectional',
        presentTense: {
            'Я': 'я иду',
            'Ты': 'ты идёшь',
            'Он/Она/Оно': 'он/она/оно идёт',
            'Мы': 'мы идём',
            'Вы': 'вы идёте',
            'Они': 'они идут'
        },
        pastTense: {
            'Я (m)': 'я шел',
            'Я (f)': 'я шла',
            'Он': 'он шел',
            'Она': 'она шла',
            'Оно': 'оно шло',
            'Мы': 'мы шли',
            'Вы': 'вы шли',
            'Они': 'они шли'
        },
        conjugations: { 'Я': 'я иду', 'Ты': 'ты идёшь', 'Он/Она/Оно': 'он/она/оно идёт', 'Мы': 'мы идём', 'Вы': 'вы идёте', 'Они': 'они идут' }
    },
    'читать': {
        infinitive: 'читать',
        meaning: 'to read',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я читаю',
            'Ты': 'ты читаешь',
            'Он/Она/Оно': 'он/она/оно читает',
            'Мы': 'мы читаем',
            'Вы': 'вы читаете',
            'Они': 'они читают'
        },
        pastTense: {
            'Я (m)': 'я читал',
            'Я (f)': 'я читала',
            'Он': 'он читал',
            'Она': 'она читала',
            'Оно': 'оно читало',
            'Мы': 'мы читали',
            'Вы': 'вы читали',
            'Они': 'они читали'
        },
        conjugations: { 'Я': 'я читаю', 'Ты': 'ты читаешь', 'Он/Она/Оно': 'он/она/оно читает', 'Мы': 'мы читаем', 'Вы': 'вы читаете', 'Они': 'они читают' }
    },
    'писать': {
        infinitive: 'писать',
        meaning: 'to write',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я пишу',
            'Ты': 'ты пишешь',
            'Он/Она/Оно': 'он/она/оно пишет',
            'Мы': 'мы пишем',
            'Вы': 'вы пишете',
            'Они': 'они пишут'
        },
        pastTense: {
            'Я (m)': 'я писал',
            'Я (f)': 'я писала',
            'Он': 'он писал',
            'Она': 'она писала',
            'Оно': 'оно писало',
            'Мы': 'мы писали',
            'Вы': 'вы писали',
            'Они': 'они писали'
        },
        conjugations: { 'Я': 'я пишу', 'Ты': 'ты пишешь', 'Он/Она/Оно': 'он/она/оно пишет', 'Мы': 'мы пишем', 'Вы': 'вы пишете', 'Они': 'они пишут' }
    },
    'слышать': {
        infinitive: 'слышать',
        meaning: 'to hear',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я слышу',
            'Ты': 'ты слышишь',
            'Он/Она/Оно': 'он/она/оно слышит',
            'Мы': 'мы слышим',
            'Вы': 'вы слышите',
            'Они': 'они слышат'
        },
        pastTense: {
            'Я (m)': 'я слышал',
            'Я (f)': 'я слышала',
            'Он': 'он слышал',
            'Она': 'она слышала',
            'Оно': 'оно слышало',
            'Мы': 'мы слышали',
            'Вы': 'вы слышали',
            'Они': 'они слышали'
        },
        conjugations: { 'Я': 'я слышу', 'Ты': 'ты слышишь', 'Он/Она/Оно': 'он/она/оно слышит', 'Мы': 'мы слышим', 'Вы': 'вы слышите', 'Они': 'они слышат' }
    },
    'видеть': {
        infinitive: 'видеть',
        meaning: 'to see',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я вижу',
            'Ты': 'ты видишь',
            'Он/Она/Оно': 'он/она/оно видит',
            'Мы': 'мы видим',
            'Вы': 'вы видите',
            'Они': 'они видят'
        },
        pastTense: {
            'Я (m)': 'я видел',
            'Я (f)': 'я видела',
            'Он': 'он видел',
            'Она': 'она видела',
            'Оно': 'оно видело',
            'Мы': 'мы видели',
            'Вы': 'вы видели',
            'Они': 'они видели'
        },
        conjugations: { 'Я': 'я вижу', 'Ты': 'ты видишь', 'Он/Она/Оно': 'он/она/оно видит', 'Мы': 'мы видим', 'Вы': 'вы видите', 'Они': 'они видят' }
    },
    'жить': {
        infinitive: 'жить',
        meaning: 'to live',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я живу',
            'Ты': 'ты живёшь',
            'Он/Она/Оно': 'он/она/оно живёт',
            'Мы': 'мы живём',
            'Вы': 'вы живёте',
            'Они': 'они живут'
        },
        pastTense: {
            'Я (m)': 'я жил',
            'Я (f)': 'я жила',
            'Он': 'он жил',
            'Она': 'она жила',
            'Оно': 'оно жило',
            'Мы': 'мы жили',
            'Вы': 'вы жили',
            'Они': 'они жили'
        },
        conjugations: { 'Я': 'я живу', 'Ты': 'ты живёшь', 'Он/Она/Оно': 'он/она/оно живёт', 'Мы': 'мы живём', 'Вы': 'вы живёте', 'Они': 'они живут' }
    },
    'любить': {
        infinitive: 'любить',
        meaning: 'to love',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я люблю',
            'Ты': 'ты любишь',
            'Он/Она/Оно': 'он/она/оно любит',
            'Мы': 'мы любим',
            'Вы': 'вы любите',
            'Они': 'они любят'
        },
        pastTense: {
            'Я (m)': 'я любил',
            'Я (f)': 'я любила',
            'Он': 'он любил',
            'Она': 'она любила',
            'Оно': 'оно любило',
            'Мы': 'мы любили',
            'Вы': 'вы любили',
            'Они': 'они любили'
        },
        conjugations: { 'Я': 'я люблю', 'Ты': 'ты любишь', 'Он/Она/Оно': 'он/она/оно любит', 'Мы': 'мы любим', 'Вы': 'вы любите', 'Они': 'они любят' }
    },
    'давать': {
        infinitive: 'давать',
        meaning: 'to give',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я даю',
            'Ты': 'ты даёшь',
            'Он/Она/Оно': 'он/она/оно даёт',
            'Мы': 'мы даём',
            'Вы': 'вы даёте',
            'Они': 'они дают'
        },
        pastTense: {
            'Я (m)': 'я давал',
            'Я (f)': 'я давала',
            'Он': 'он давал',
            'Она': 'она давала',
            'Оно': 'оно давало',
            'Мы': 'мы давали',
            'Вы': 'вы давали',
            'Они': 'они давали'
        },
        conjugations: { 'Я': 'я даю', 'Ты': 'ты даёшь', 'Он/Она/Оно': 'он/она/оно даёт', 'Мы': 'мы даём', 'Вы': 'вы даёте', 'Они': 'они дают' }
    },
    'брать': {
        infinitive: 'брать',
        meaning: 'to take',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я беру',
            'Ты': 'ты берёшь',
            'Он/Она/Оно': 'он/она/оно берёт',
            'Мы': 'мы берём',
            'Вы': 'вы берёте',
            'Они': 'они берут'
        },
        pastTense: {
            'Я (m)': 'я брал',
            'Я (f)': 'я брала',
            'Он': 'он брал',
            'Она': 'она брала',
            'Оно': 'оно брало',
            'Мы': 'мы брали',
            'Вы': 'вы брали',
            'Они': 'они брали'
        },
        conjugations: { 'Я': 'я беру', 'Ты': 'ты берёшь', 'Он/Она/Оно': 'он/она/оно берёт', 'Мы': 'мы берём', 'Вы': 'вы берёте', 'Они': 'они берут' }
    },
    'знать': {
        infinitive: 'знать',
        meaning: 'to know',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я знаю',
            'Ты': 'ты знаешь',
            'Он/Она/Оно': 'он/она/оно знает',
            'Мы': 'мы знаем',
            'Вы': 'вы знаете',
            'Они': 'они знают'
        },
        pastTense: {
            'Я (m)': 'я знал',
            'Я (f)': 'я знала',
            'Он': 'он знал',
            'Она': 'она знала',
            'Оно': 'оно знало',
            'Мы': 'мы знали',
            'Вы': 'вы знали',
            'Они': 'они знали'
        },
        conjugations: { 'Я': 'я знаю', 'Ты': 'ты знаешь', 'Он/Она/Оно': 'он/она/оно знает', 'Мы': 'мы знаем', 'Вы': 'вы знаете', 'Они': 'они знают' }
    },
    'работать': {
        infinitive: 'работать',
        meaning: 'to work',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я работаю',
            'Ты': 'ты работаешь',
            'Он/Она/Оно': 'он/она/оно работает',
            'Мы': 'мы работаем',
            'Вы': 'вы работаете',
            'Они': 'они работают'
        },
        pastTense: {
            'Я (m)': 'я работал',
            'Я (f)': 'я работала',
            'Он': 'он работал',
            'Она': 'она работала',
            'Оно': 'оно работало',
            'Мы': 'мы работали',
            'Вы': 'вы работали',
            'Они': 'они работали'
        },
        conjugations: { 'Я': 'я работаю', 'Ты': 'ты работаешь', 'Он/Она/Оно': 'он/она/оно работает', 'Мы': 'мы работаем', 'Вы': 'вы работаете', 'Они': 'они работают' }
    },
    'учить': {
        infinitive: 'учить',
        meaning: 'to study/learn',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я учу',
            'Ты': 'ты учишь',
            'Он/Она/Оно': 'он/она/оно учит',
            'Мы': 'мы учим',
            'Вы': 'вы учите',
            'Они': 'они учат'
        },
        pastTense: {
            'Я (m)': 'я учил',
            'Я (f)': 'я учила',
            'Он': 'он учил',
            'Она': 'она учила',
            'Оно': 'оно учило',
            'Мы': 'мы учили',
            'Вы': 'вы учили',
            'Они': 'они учили'
        },
        conjugations: { 'Я': 'я учу', 'Ты': 'ты учишь', 'Он/Она/Оно': 'он/она/оно учит', 'Мы': 'мы учим', 'Вы': 'вы учите', 'Они': 'они учат' }
    },
    'приходить': {
        infinitive: 'приходить',
        meaning: 'to come',
        aspect: 'imperfective',
        directionality: 'multidirectional',
        presentTense: {
            'Я': 'я прихожу',
            'Ты': 'ты приходишь',
            'Он/Она/Оно': 'он/она/оно приходит',
            'Мы': 'мы приходим',
            'Вы': 'вы приходите',
            'Они': 'они приходят'
        },
        pastTense: {
            'Я (m)': 'я приходил',
            'Я (f)': 'я приходила',
            'Он': 'он приходил',
            'Она': 'она приходила',
            'Оно': 'оно приходило',
            'Мы': 'мы приходили',
            'Вы': 'вы приходили',
            'Они': 'они приходили'
        },
        conjugations: { 'Я': 'я прихожу', 'Ты': 'ты приходишь', 'Он/Она/Оно': 'он/она/оно приходит', 'Мы': 'мы приходим', 'Вы': 'вы приходите', 'Они': 'они приходят' }
    },
    'ходить': {
        infinitive: 'ходить',
        meaning: 'to walk/go',
        aspect: 'imperfective',
        directionality: 'multidirectional',
        presentTense: {
            'Я': 'я хожу',
            'Ты': 'ты ходишь',
            'Он/Она/Оно': 'он/она/оно ходит',
            'Мы': 'мы ходим',
            'Вы': 'вы ходите',
            'Они': 'они ходят'
        },
        pastTense: {
            'Я (m)': 'я ходил',
            'Я (f)': 'я ходила',
            'Он': 'он ходил',
            'Она': 'она ходила',
            'Оно': 'оно ходило',
            'Мы': 'мы ходили',
            'Вы': 'вы ходили',
            'Они': 'они ходили'
        },
        conjugations: { 'Я': 'я хожу', 'Ты': 'ты ходишь', 'Он/Она/Оно': 'он/она/оно ходит', 'Мы': 'мы ходим', 'Вы': 'вы ходите', 'Они': 'они ходят' }
    },
    'понимать': {
        infinitive: 'понимать',
        meaning: 'to understand',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я понимаю',
            'Ты': 'ты понимаешь',
            'Он/Она/Оно': 'он/она/оно понимает',
            'Мы': 'мы понимаем',
            'Вы': 'вы понимаете',
            'Они': 'они понимают'
        },
        pastTense: {
            'Я (m)': 'я понимал',
            'Я (f)': 'я понимала',
            'Он': 'он понимал',
            'Она': 'она понимала',
            'Оно': 'оно понимало',
            'Мы': 'мы понимали',
            'Вы': 'вы понимали',
            'Они': 'они понимали'
        },
        conjugations: { 'Я': 'я понимаю', 'Ты': 'ты понимаешь', 'Он/Она/Оно': 'он/она/оно понимает', 'Мы': 'мы понимаем', 'Вы': 'вы понимаете', 'Они': 'они понимают' }
    },
    'просить': {
        infinitive: 'просить',
        meaning: 'to ask/request',
        aspect: 'imperfective',
        directionality: 'non-directional',
        presentTense: {
            'Я': 'я прошу',
            'Ты': 'ты просишь',
            'Он/Она/Оно': 'он/она/оно просит',
            'Мы': 'мы просим',
            'Вы': 'вы просите',
            'Они': 'они просят'
        },
        pastTense: {
            'Я (m)': 'я просил',
            'Я (f)': 'я просила',
            'Он': 'он просил',
            'Она': 'она просила',
            'Оно': 'оно просило',
            'Мы': 'мы просили',
            'Вы': 'вы просили',
            'Они': 'они просили'
        },
        conjugations: { 'Я': 'я прошу', 'Ты': 'ты просишь', 'Он/Она/Оно': 'он/она/оно просит', 'Мы': 'мы просим', 'Вы': 'вы просите', 'Они': 'они просят' }
    }
};

// Main Vocabulary Tracker Class
class VocabTracker {
    constructor() {
        this.vocabulary = this.loadData();
        this.exportHistory = this.loadExportHistory();
        this.apiCache = this.loadApiCache();
        this.customCategories = this.loadCustomCategories();
        this.currentFilter = 'all';
        this.currentFilterType = 'category';
        this.currentWordTypeFilter = 'all-types';
        this.currentSearch = '';
        this.currentPage = 'dashboard';
        this.currentConjugationTab = 'present';
        this.currentVerbEntry = null;
        this.pendingWordType = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.updateDisplay();
        this.updateDate();
        this.updateSidebarTime();
        this.updateCategoryDropdown();
        this.autoTranslateTimeout = null;
    }

    debounceAutoTranslate(word) {
        // Clear previous timeout
        if (this.autoTranslateTimeout) {
            clearTimeout(this.autoTranslateTimeout);
        }

        const wordTrimmed = word.trim();

        // Check if it's a Russian word
        if (!wordTrimmed || !TranslationAPI.isRussian(wordTrimmed)) {
            this.hideSuggestions();
            return;
        }

        // Show loading indicator
        document.getElementById('wordLoading').style.display = 'flex';

        // Debounce the API call
        this.autoTranslateTimeout = setTimeout(() => {
            this.autoTranslateWord(wordTrimmed);
        }, 500);
    }

    async autoTranslateWord(word) {
        try {
            const result = await TranslationAPI.translateWord(word);

            if (result.success) {
                // Hide loading
                document.getElementById('wordLoading').style.display = 'none';

                // AUTO-FILL translation (v2.4 feature)
                document.getElementById('translationInput').value = result.translation;
                
                // Display word category with color
                this.displayWordCategory(result);
                
                // For verbs, prepare conjugation chart
                if (result.categoryType === 'verb') {
                    this.prepareVerbConjugations(word.toLowerCase());
                }
                
                // Hide suggestions since we auto-filled
                this.hideSuggestions();
            } else {
                document.getElementById('wordLoading').style.display = 'none';
                this.hideSuggestions();
            }
        } catch (error) {
            console.error('Translation error:', error);
            document.getElementById('wordLoading').style.display = 'none';
            this.hideSuggestions();
        }
    }

    displayWordCategory(result) {
        const categoryDiv = document.getElementById('wordCategory');
        if (categoryDiv) {
            categoryDiv.innerHTML = `
                <span class="category-badge" style="background-color: ${result.categoryColor}">
                    ${result.category}
                </span>
            `;
            categoryDiv.style.display = 'flex';
        }
    }

    prepareVerbConjugations(verbLowercase) {
        const verbInfo = RUSSIAN_VERBS[verbLowercase];
        if (verbInfo) {
            // Store for displaying when needed
            this.currentVerbConjugations = verbInfo.conjugations;
        }
    }

    showTranslationSuggestions(result) {
        const suggestionsDiv = document.getElementById('translationSuggestions');
        
        let html = `
            <div class="suggestion-item" onclick="tracker.acceptTranslation('${this.escapeHtml(result.translation)}')">
                <div class="suggestion-main">${this.escapeHtml(result.translation)}</div>
                <div class="suggestion-source">via ${result.source}</div>
            </div>
        `;

        suggestionsDiv.innerHTML = html;
        suggestionsDiv.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsDiv = document.getElementById('translationSuggestions');
        suggestionsDiv.style.display = 'none';
    }

    acceptTranslation(translation) {
        document.getElementById('translationInput').value = translation;
        this.hideSuggestions();
        document.getElementById('wordInput').focus();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.goToPage(page);
            });
        });
    }

    goToPage(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // Show selected page
        document.getElementById(page).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        this.currentPage = page;

        if (page === 'exports') {
            this.renderExportHistory();
        }
    }

    setupEventListeners() {
        // Add word
        document.getElementById('addBtn').addEventListener('click', () => this.addWord());
        document.getElementById('wordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWord();
        });

        // Auto-translate on word input
        document.getElementById('wordInput').addEventListener('input', (e) => {
            this.debounceAutoTranslate(e.target.value);
        });

        // Hide suggestions when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.form-grid')) {
                this.hideSuggestions();
            }
        });

        // Filter buttons - category and word type
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filterType || 'category';
                const selector = filterType === 'category' 
                    ? '.filter-btn[data-filter-type="category"]'
                    : '.filter-btn[data-filter-type="wordtype"]';
                
                document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                if (filterType === 'category') {
                    this.currentFilter = e.target.dataset.filter;
                } else {
                    this.currentWordTypeFilter = e.target.dataset.filter;
                }
                this.renderVocabulary();
            });
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderVocabulary();
        });

        // Export buttons
        document.getElementById('exportAnkiBtn').addEventListener('click', () => this.exportToAnki());
        document.getElementById('exportQuizletBtn').addEventListener('click', () => this.exportToQuizlet());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJSON());

        // Import
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('fileInput').addEventListener('change', (e) => this.importData(e));

        // Settings
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());
    }

    // Handle word type selection from modal
    selectWordType(wordType) {
        this.pendingWordType = wordType;
        document.getElementById('wordTypeModal').style.display = 'none';
        this.proceedWithWordType(wordType);
    }

    // Proceed with adding word after type is confirmed
    async proceedWithWordType(wordType) {
        const wordInput = document.getElementById('wordInput');
        const word = wordInput.value.trim();
        
        // Map word type to expected format
        const typeMap = {
            'noun': 'noun',
            'verb': 'verb',
            'adjective': 'adjective',
            'adverb': 'adverb'
        };
        
        // If verb, fetch conjugation data
        if (wordType === 'verb') {
            const verbData = RUSSIAN_VERBS[word.toLowerCase()];
            if (verbData) {
                this.showNotification(`✓ Verb conjugations found for "${word}"`, 'success');
            }
        }
        
        // Continue with the add process (called from addWord)
    }

    // Create custom category
    createCustomCategory() {
        const nameInput = document.getElementById('customCategoryName');
        const emojiSelect = document.getElementById('customCategoryEmoji');
        
        const name = nameInput.value.trim();
        const emoji = emojiSelect.value;
        
        if (!name) {
            this.showNotification('Please enter a category name', 'error');
            return;
        }
        
        // Convert name to lowercase for storage key
        const key = name.toLowerCase().replace(/\s+/g, '_');
        
        if (this.customCategories[key]) {
            this.showNotification('Category already exists', 'error');
            return;
        }
        
        // Add custom category
        this.customCategories[key] = {
            name: name,
            emoji: emoji,
            key: key
        };
        
        this.saveCustomCategories();
        
        // Update category dropdown
        this.updateCategoryDropdown();
        
        // Clear inputs and close modal
        nameInput.value = '';
        document.getElementById('customCategoryModal').style.display = 'none';
        
        this.showNotification(`✓ Category "${name}" created!`, 'success');
    }

    // Update category select dropdown with custom categories
    updateCategoryDropdown() {
        const categorySelect = document.getElementById('categorySelect');
        const currentValue = categorySelect.value;
        
        // Clear and rebuild options
        categorySelect.innerHTML = '<option value="">Select Category</option>' +
            '<option value="review">📋 Review</option>' +
            '<option value="supplemental">📚 Supplemental</option>' +
            '<option value="critical">⭐ Critical</option>' +
            '<option value="lesson">📖 Lesson</option>';
        
        // Add custom categories
        for (const [key, category] of Object.entries(this.customCategories)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${category.emoji} ${category.name}`;
            categorySelect.appendChild(option);
        }
        
        categorySelect.value = currentValue;
    }

    async addWord() {
        const wordInput = document.getElementById('wordInput');
        const translationInput = document.getElementById('translationInput');
        const sentenceInput = document.getElementById('sentenceInput');
        const categoryInput = document.getElementById('categorySelect');

        const word = wordInput.value.trim();
        const manualTranslation = translationInput.value.trim();
        const sentence = sentenceInput.value.trim();
        const category = categoryInput.value;

        if (!word || !category) {
            this.showNotification('Please fill in Russian word and category', 'error');
            return;
        }

        const btn = document.getElementById('addBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Fetching...';
        btn.disabled = true;

        try {
            // Get translation and word type info
            const translationResult = await TranslationAPI.translateWord(word);
            const translation = translationResult.success ? translationResult.translation : manualTranslation;
            let wordType = translationResult.categoryType || 'noun';
            let wordCategory = translationResult.category || 'Noun';
            const confidence = translationResult.confidence || 50;

            // NEW: Show word type selector for low confidence
            if (translationResult.success && confidence < 80) {
                // Store current state and show modal
                this.pendingWord = word;
                this.pendingTranslation = translation;
                this.pendingSentence = sentence;
                this.pendingCategory = category;
                this.pendingTranslationResult = translationResult;
                
                btn.textContent = originalText;
                btn.disabled = false;
                
                document.getElementById('wordTypeModal').style.display = 'flex';
                return;
            }

            // Show alert if classification was overridden by validation
            if (translationResult.overridden) {
                this.showNotification(`⚠️ Classification corrected: "${word}" is a Noun (not ${translationResult.detectedType})`, 'info');
            }

            // STRESS DETECTION AND VALIDATION
            const stressIndex = TranslationAPI.detectStress(word);
            const stressValidation = TranslationAPI.validateStress(word, stressIndex);
            
            // Show stress validation to user if confidence is medium
            if (stressValidation.confidence < 100 && stressValidation.confidence > 0) {
                const stressConfirmMsg = `Stress Detection (${stressValidation.confidence}% confidence):\n\n${stressValidation.message}\n\nAccept this stress placement?`;
                if (!confirm(stressConfirmMsg)) {
                    this.showNotification('Word not added. Please re-enter with correct stress.', 'info');
                    btn.textContent = originalText;
                    btn.disabled = false;
                    return;
                }
            }

            const { examples, isVerb, conjugations } = await this.fetchWordData(word, translation);

            // Check if word is in RUSSIAN_VERBS database and pull all conjugation data
            const verbData = RUSSIAN_VERBS[word.toLowerCase()];
            const fullConjugations = verbData || conjugations || null;

            // Apply stress formatting for display
            const wordWithStress = TranslationAPI.applyStressFormatting(word, stressIndex);

            const newEntry = {
                id: Date.now(),
                word: word,
                wordDisplayed: wordWithStress,
                translation: translation,
                sentence: sentence || null,
                category: category,
                wordType: wordType,
                wordCategory: wordCategory,
                dateAdded: new Date().toISOString().split('T')[0],
                lastReviewed: null,
                examples: examples || [],
                isVerb: isVerb || wordType === 'verb',
                conjugations: fullConjugations || null,
                confidence: confidence,
                stressIndex: stressIndex,
                stressConfidence: stressValidation.confidence
            };

            this.vocabulary.push(newEntry);
            this.saveData();
            this.updateDisplay();

            wordInput.value = '';
            translationInput.value = '';
            sentenceInput.value = '';
            categoryInput.value = '';
            const categoryDiv = document.getElementById('wordCategory');
            if (categoryDiv) categoryDiv.style.display = 'none';
            wordInput.focus();

            this.showNotification('Word added successfully with stress marking!', 'success');

        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error adding word. Please try again.', 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async fetchWordData(word, manualTranslation) {
        const cacheKey = word.toLowerCase();

        if (this.apiCache[cacheKey]) {
            return this.apiCache[cacheKey];
        }

        let result = {
            translation: manualTranslation || 'Unknown',
            examples: [],
            isVerb: false,
            conjugations: null
        };

        const verbLower = word.toLowerCase();
        if (RUSSIAN_VERBS[verbLower]) {
            const verbData = RUSSIAN_VERBS[verbLower];
            result.translation = verbData.meaning;
            result.isVerb = true;
            result.conjugations = verbData.conjugations;
            result.examples = ['Common Russian verb'];
        }

        this.apiCache[cacheKey] = result;
        this.saveApiCache();

        return result;
    }

    deleteWord(id) {
        if (confirm('Are you sure you want to delete this word?')) {
            this.vocabulary = this.vocabulary.filter(item => item.id !== id);
            this.saveData();
            this.updateDisplay();
        }
    }

    editWord(id) {
        const word = this.vocabulary.find(item => item.id === id);
        if (!word) return;

        const newWord = prompt('Edit word:', word.word);
        if (newWord === null) return;

        const newTranslation = prompt('Edit translation:', word.translation);
        if (newTranslation === null) return;

        word.word = newWord.trim();
        word.translation = newTranslation.trim();
        word.lastReviewed = new Date().toISOString().split('T')[0];

        this.saveData();
        this.updateDisplay();
    }

    toggleConjugationPanel(id) {
        const panel = document.getElementById(`conjugations-${id}`);
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    showVerbConjugationModal(id, verbWord) {
        const entry = this.vocabulary.find(v => v.id === id);
        if (!entry) return;

        // Store current tab state
        this.currentConjugationTab = 'present';
        this.currentVerbEntry = entry;

        const modal = document.getElementById('conjugationModal');
        const title = document.getElementById('modalVerbTitle');
        const metadata = document.getElementById('verbMetadata');
        
        title.textContent = `${this.escapeHtml(verbWord)} Conjugations`;
        
        // Display verb metadata (aspect and directionality)
        const verb = RUSSIAN_VERBS[verbWord.toLowerCase()];
        if (verb) {
            const aspect = verb.aspect ? verb.aspect.charAt(0).toUpperCase() + verb.aspect.slice(1) : '';
            const directionality = verb.directionality ? verb.directionality.charAt(0).toUpperCase() + verb.directionality.slice(1) : '';
            metadata.textContent = `${aspect}${aspect && directionality ? ' • ' : ''}${directionality}`;
            metadata.style.display = aspect || directionality ? 'block' : 'none';
        }

        // Reset tabs to present
        document.getElementById('presentTab').classList.add('active');
        document.getElementById('pastTab').classList.remove('active');

        this.displayConjugationChart('present', entry);
        modal.style.display = 'flex';

        // Close modal when clicking outside
        const closeHandler = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.removeEventListener('click', closeHandler);
            }
        };
        modal.addEventListener('click', closeHandler);
    }

    switchConjugationTab(tab) {
        if (!this.currentVerbEntry) return;

        this.currentConjugationTab = tab;

        // Update tab buttons
        document.getElementById('presentTab').classList.toggle('active', tab === 'present');
        document.getElementById('pastTab').classList.toggle('active', tab === 'past');

        // Display appropriate conjugations
        this.displayConjugationChart(tab, this.currentVerbEntry);
    }

    displayConjugationChart(tab, entry) {
        const conjugationChart = document.getElementById('conjugationChart');
        let conjugations;

        // Try to get from entry first, then fall back to RUSSIAN_VERBS database
        if (tab === 'past') {
            if (entry.pastTense) {
                conjugations = entry.pastTense;
            } else {
                // Look up in database
                const verbData = RUSSIAN_VERBS[this.currentVerbEntry.word.toLowerCase()];
                conjugations = verbData?.pastTense || entry.conjugations || {};
            }
        } else {
            if (entry.conjugations && entry.conjugations.presentTense) {
                conjugations = entry.conjugations.presentTense;
            } else if (entry.conjugations) {
                conjugations = entry.conjugations;
            } else {
                // Look up in database
                const verbData = RUSSIAN_VERBS[this.currentVerbEntry.word.toLowerCase()];
                conjugations = verbData?.presentTense || verbData?.conjugations || {};
            }
        }

        if (!conjugations || Object.keys(conjugations).length === 0) {
            conjugationChart.innerHTML = '<p style="text-align: center; color: #999;">No conjugations available</p>';
            return;
        }

        conjugationChart.innerHTML = Object.entries(conjugations).map(([person, form]) => `
            <div class="conjugation-item">
                <div class="conjugation-person">${person}</div>
                <div class="conjugation-form">${this.escapeHtml(form)}</div>
            </div>
        `).join('');
    }

    updateDisplay() {
        this.updateStats();
        this.renderVocabulary();
        this.updateAboutInfo();
    }

    updateStats() {
        const total = this.vocabulary.length;
        const review = this.vocabulary.filter(v => v.category === 'review').length;
        const supplemental = this.vocabulary.filter(v => v.category === 'supplemental').length;
        const critical = this.vocabulary.filter(v => v.category === 'critical').length;
        const lesson = this.vocabulary.filter(v => v.category === 'lesson').length;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('reviewCount').textContent = review;
        document.getElementById('supplementalCount').textContent = supplemental;
        document.getElementById('criticalCount').textContent = critical;
        document.getElementById('lessonCount').textContent = lesson;
    }

    renderVocabulary() {
        const vocabList = document.getElementById('vocabList');

        let filtered = this.vocabulary;

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(v => v.category === this.currentFilter);
        }

        // Apply word type filter
        if (this.currentWordTypeFilter !== 'all-types') {
            filtered = filtered.filter(v => v.wordType === this.currentWordTypeFilter);
        }

        // Apply search filter
        if (this.currentSearch) {
            filtered = filtered.filter(v =>
                v.word.toLowerCase().includes(this.currentSearch) ||
                v.translation.toLowerCase().includes(this.currentSearch)
            );
        }

        // Sort by date added (newest first)
        filtered = filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        if (filtered.length === 0) {
            vocabList.innerHTML = '<p class="empty-state">No words match your filters.</p>';
            return;
        }

        vocabList.innerHTML = filtered.map(entry => {
            const wordTypeClass = entry.wordType ? `word-type-${entry.wordType}` : 'word-type-noun';
            const wordCategory = entry.wordCategory || 'Noun';
            // Use wordDisplayed (with stress) if available, otherwise use original word
            const displayWord = entry.wordDisplayed ? entry.wordDisplayed : this.escapeHtml(entry.word);
            const stressInfo = entry.stressConfidence ? `<span class="stress-indicator" title="Stress confidence: ${entry.stressConfidence}%">✓</span>` : '';
            
            return `
            <div class="vocab-card">
                <div class="vocab-content">
                    <div class="vocab-word">
                        ${displayWord}
                        ${stressInfo}
                        <span class="word-type-badge ${wordTypeClass}">${wordCategory}</span>
                    </div>
                    <div class="vocab-translation"><strong>Translation:</strong> ${this.escapeHtml(entry.translation)}</div>
                    
                    ${entry.sentence ? `<div class="vocab-date"><strong>Example:</strong> "${this.escapeHtml(entry.sentence)}"</div>` : ''}
                    
                    ${this.getSynonymsSection(entry)}
                    
                    ${entry.isVerb ? `
                        <div style="margin-top: 10px;">
                            <button class="btn btn-secondary" onclick="tracker.showVerbConjugationModal(${entry.id}, '${this.escapeHtml(entry.word)}')" style="width: 100%; padding: 8px;">
                                📊 Show Conjugations
                            </button>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="vocab-tag tag-${entry.category}">${this.getCategoryEmoji(entry.category)} ${this.capitalizeFirst(entry.category)}</span>
                        <span class="vocab-date">Added: ${entry.dateAdded}</span>
                    </div>
                </div>
                <div class="vocab-actions">
                    <button class="btn btn-secondary" onclick="tracker.editWord(${entry.id})">Edit</button>
                    <button class="btn btn-danger" onclick="tracker.deleteWord(${entry.id})">Delete</button>
                </div>
            </div>
        `}).join('');
    }

    // ========== ANKI EXPORT ==========
    exportToAnki() {
        try {
            const category = document.getElementById('ankiCategory').value;
            const words = this.getFilteredWords(category);

            if (words.length === 0) {
                this.showNotification('No words to export', 'error');
                return;
            }

            // Format: word\ttranslation\texample
            const ankiContent = words
                .map(w => {
                    const example = w.sentence || w.examples?.[0] || '';
                    return `${w.word}\t${w.translation}\t${example}`;
                })
                .join('\n');

            const blob = new Blob([ankiContent], { type: 'text/plain;charset=utf-8' });
            const fileName = `russian-vocab-anki-${category}-${new Date().toISOString().split('T')[0]}.txt`;
            this.downloadFile(blob, fileName);

            this.recordExport('Anki', category, words.length);
            this.showNotification(`Exported ${words.length} words to Anki format!`, 'success');
        } catch (error) {
            console.error('Anki export error:', error);
            this.showNotification('Error exporting to Anki', 'error');
        }
    }

    // ========== QUIZLET EXPORT ==========
    exportToQuizlet() {
        try {
            const category = document.getElementById('quizletCategory').value;
            const words = this.getFilteredWords(category);

            if (words.length === 0) {
                this.showNotification('No words to export', 'error');
                return;
            }

            // Format: russian\tenglish (with newlines between)
            const quizletContent = words
                .map(w => `${w.word}\t${w.translation}`)
                .join('\n');

            const blob = new Blob([quizletContent], { type: 'text/plain;charset=utf-8' });
            const fileName = `russian-vocab-quizlet-${category}-${new Date().toISOString().split('T')[0]}.txt`;
            this.downloadFile(blob, fileName);

            this.recordExport('Quizlet', category, words.length);
            this.showNotification(`Exported ${words.length} words to Quizlet format!`, 'success');
        } catch (error) {
            console.error('Quizlet export error:', error);
            this.showNotification('Error exporting to Quizlet', 'error');
        }
    }

    // ========== JSON EXPORT ==========
    exportJSON() {
        try {
            const dataStr = JSON.stringify(this.vocabulary, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const fileName = `russian-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
            this.downloadFile(blob, fileName);

            this.recordExport('JSON Backup', 'all', this.vocabulary.length);
            this.showNotification(`Exported ${this.vocabulary.length} words to JSON!`, 'success');
        } catch (error) {
            console.error('JSON export error:', error);
            this.showNotification('Error exporting to JSON', 'error');
        }
    }

    getFilteredWords(category) {
        if (category === 'all') {
            return this.vocabulary;
        }
        return this.vocabulary.filter(w => w.category === category);
    }

    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    recordExport(platform, category, count) {
        if (!this.exportHistory) this.exportHistory = [];
        
        this.exportHistory.unshift({
            id: Date.now(),
            platform: platform,
            category: category,
            count: count,
            timestamp: new Date().toLocaleString()
        });

        // Keep only last 10 exports
        this.exportHistory = this.exportHistory.slice(0, 10);
        this.saveExportHistory();
    }

    renderExportHistory() {
        const historyDiv = document.getElementById('exportHistory');
        
        if (!this.exportHistory || this.exportHistory.length === 0) {
            historyDiv.innerHTML = '<p class="empty-state">No exports yet</p>';
            return;
        }

        historyDiv.innerHTML = this.exportHistory
            .map(exp => `
                <div class="export-history-item">
                    <div class="item-info">
                        <p><strong>${exp.platform}</strong></p>
                        <p>${exp.count} words • ${this.capitalizeFirst(exp.category)}</p>
                        <p class="date">${exp.timestamp}</p>
                    </div>
                </div>
            `)
            .join('');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported)) {
                    this.showNotification('Invalid file format', 'error');
                    return;
                }

                const shouldMerge = confirm('Merge with existing vocabulary? (Cancel will replace all data)');

                if (shouldMerge) {
                    const existingIds = new Set(this.vocabulary.map(v => v.id));
                    const newEntries = imported.filter(entry => !existingIds.has(entry.id));
                    this.vocabulary = [...this.vocabulary, ...newEntries];
                } else {
                    this.vocabulary = imported;
                }

                this.saveData();
                this.updateDisplay();
                this.showNotification(`Successfully imported ${imported.length} words!`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Error importing file', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    clearAllData() {
        if (confirm('⚠️ This will permanently delete all your vocabulary data. Are you sure?')) {
            if (confirm('This action cannot be undone. Are you absolutely sure?')) {
                this.vocabulary = [];
                this.exportHistory = [];
                this.apiCache = {};
                this.saveData();
                this.saveExportHistory();
                this.saveApiCache();
                this.updateDisplay();
                this.showNotification('All data cleared', 'success');
            }
        }
    }

    updateAboutInfo() {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const storageSize = new Blob([JSON.stringify(this.vocabulary)]).size;
        const storageSizeKB = (storageSize / 1024).toFixed(2);

        document.getElementById('lastUpdatedInfo').textContent = `Last updated: ${today}`;
        document.getElementById('dataStatsInfo').innerHTML = `
            <p>Total words: <strong>${this.vocabulary.length}</strong></p>
            <p>Storage used: <strong>${storageSizeKB} KB</strong></p>
            <p>Exports: <strong>${this.exportHistory?.length || 0}</strong></p>
        `;
    }

    showNotification(message, type = 'info') {
        // Create a simple notification (you can enhance this)
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: #d1fae5; color: #065f46;' : ''}
            ${type === 'error' ? 'background: #fee2e2; color: #991b1b;' : ''}
            ${type === 'info' ? 'background: #dbeafe; color: #0c2340;' : ''}
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateDate() {
        const today = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const dateString = today.toLocaleDateString('en-US', options);
        const elem = document.getElementById('dateDisplay');
        if (elem) elem.textContent = dateString;
    }

    updateSidebarTime() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const elem = document.getElementById('sidebarTime');
            if (elem) elem.textContent = timeString;
        };
        updateTime();
        setInterval(updateTime, 60000);
    }

    getCategoryEmoji(category) {
        const emojis = {
            'review': '📋',
            'supplemental': '📚',
            'critical': '⭐',
            'lesson': '📖'
        };
        return emojis[category] || '';
    }

    getSynonymsSection(entry) {
        const wordLower = entry.word.toLowerCase();
        const synonyms = SYNONYMS[wordLower];
        
        if (!synonyms || synonyms.length === 0) {
            return '';
        }

        const expandId = `syn-expand-${entry.id}`;
        const contentId = `syn-content-${entry.id}`;
        
        // Show first synonym as preview
        const firstSynonym = synonyms[0];
        const previewText = `${firstSynonym.rus} (${firstSynonym.eng})`;
        
        // All synonyms for expanded view
        const allSynonymsHtml = synonyms.map(syn => 
            `<div style="padding: 8px 0; border-bottom: 1px solid var(--border-light);">
                <strong>${this.escapeHtml(syn.rus)}</strong> <em>(${this.escapeHtml(syn.eng)})</em>
            </div>`
        ).join('');
        
        return `
            <div style="margin-top: 12px; padding: 10px; background: var(--bg); border-radius: 6px; border-left: 3px solid var(--primary);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 600; color: var(--primary);">📚 Synonyms:</span>
                    <span>${previewText}</span>
                    ${synonyms.length > 1 ? `<button class="btn-text" onclick="tracker.toggleSynonymsExpand('${expandId}', '${contentId}')" style="padding: 0; color: var(--primary); text-decoration: underline; cursor: pointer; border: none; background: none; font-size: 0.9em;">Expand</button>` : ''}
                </div>
                <div id="${contentId}" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-light);">
                    ${allSynonymsHtml}
                </div>
            </div>
        `;
    }

    toggleSynonymsExpand(expandId, contentId) {
        const content = document.getElementById(contentId);
        if (content.style.display === 'none') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveData() {
        try {
            localStorage.setItem('russianVocab', JSON.stringify(this.vocabulary));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    loadData() {
        try {
            const data = localStorage.getItem('russianVocab');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    }

    saveExportHistory() {
        try {
            localStorage.setItem('russianVocabExportHistory', JSON.stringify(this.exportHistory));
        } catch (error) {
            console.error('Error saving export history:', error);
        }
    }

    loadExportHistory() {
        try {
            const data = localStorage.getItem('russianVocabExportHistory');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading export history:', error);
            return [];
        }
    }

    saveApiCache() {
        try {
            localStorage.setItem('russianVocabApiCache', JSON.stringify(this.apiCache));
        } catch (error) {
            console.error('Error saving API cache:', error);
        }
    }

    loadApiCache() {
        try {
            const cache = localStorage.getItem('russianVocabApiCache');
            return cache ? JSON.parse(cache) : {};
        } catch (error) {
            console.error('Error loading API cache:', error);
            return {};
        }
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('russianVocabCustomCategories', JSON.stringify(this.customCategories));
        } catch (error) {
            console.error('Error saving custom categories:', error);
            this.showNotification('Error saving custom categories', 'error');
        }
    }

    loadCustomCategories() {
        try {
            const data = localStorage.getItem('russianVocabCustomCategories');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading custom categories:', error);
            return {};
        }
    }
}

// Initialize app
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new VocabTracker();
});
