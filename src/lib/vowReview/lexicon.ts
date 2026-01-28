/**
 * Comprehensive vow cliché and weak phrase lexicon for wedding vow analysis.
 * Contains all weak phrases, patterns, categories, and replacement suggestions.
 */

import type { VowLexiconItem } from './types'

/**
 * The comprehensive vow lexicon.
 * Organized by category with all variants and patterns.
 */
export const vowLexicon: VowLexiconItem[] = [
	// ============================================================
	// 1) CLICHÉ OPENINGS (high severity)
	// ============================================================
	{
		key: 'from_the_moment',
		patterns: [
			// Full phrase variations
			/\bfrom\s+the\s+(?:very\s+)?(?:first\s+)?moment\s+(?:I|i|we)\s+(?:saw|met|laid\s+eyes\s+on|first\s+met)\b/gi,
			// Simpler base pattern - "from the moment" followed by common continuations
			/\bfrom\s+the\s+(?:very\s+)?(?:first\s+)?moment\s+(?:I|i|we)\b/gi,
			// Even simpler - just "from the moment" as a sentence starter
			/\bfrom\s+the\s+(?:very\s+)?(?:first\s+)?moment\b/gi,
		],
		category: 'cliche_opening',
		why: 'This opening is used in countless vows and romantic movies. It can feel impersonal without a specific detail.',
		suggestions: [
			'Start with the actual moment: "That Tuesday at the coffee shop..."',
			'Name the place and what you noticed first',
			'Describe what you were doing when you first saw them',
			'Share what you were thinking in that moment',
			'Mention who introduced you or what event brought you together',
		],
		proofPrompts: [
			'Where exactly did you first meet?',
			'What was the first thing you noticed about them?',
			'What were you doing/wearing/thinking?',
			'Who else was there?',
		],
		weight: 2,
	},
	{
		key: 'i_knew_you_were_the_one',
		patterns: [
			/\b(?:I|i)\s+knew\s+(?:right\s+then\s+)?(?:that\s+)?you\s+were\s+the\s+one\b/gi,
			/\b(?:I|i)\s+knew\s+(?:you\s+were\s+)?(?:the\s+one|my\s+person)\s+(?:for\s+me)?\b/gi,
		],
		category: 'cliche_opening',
		why: 'This phrase appears in most romantic movies. Make it yours by sharing WHEN and WHY you knew.',
		suggestions: [
			'Describe the specific moment you realized this',
			'Share what they did that made you certain',
			'Tell the story of your "aha" moment',
			'Explain what changed in that instant',
			'Describe the feeling in your own words',
		],
		proofPrompts: [
			'When exactly did you know? What happened?',
			'What did they do or say that confirmed it?',
			'How did that realization feel physically?',
			'What did you do right after that moment?',
		],
		weight: 2,
	},
	{
		key: 'when_we_first_met',
		patterns: [/\bwhen\s+(?:we\s+)?(?:first\s+)?met\b/gi],
		category: 'cliche_opening',
		why: 'A common opener that works better when you add the WHERE and WHAT.',
		suggestions: [
			'Add the location and circumstance',
			'Describe what happened that day',
			'Share your first impression',
			'Tell what you were doing before meeting them',
			'Mention the date or season',
		],
		proofPrompts: [
			'What was the setting? The weather?',
			'What were you both doing there?',
			'What did you notice first?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'standing_here_today',
		patterns: [
			/\b(?:standing|as\s+I\s+stand)\s+here\s+(?:today|now|before\s+you)\b/gi,
			/\bon\s+this\s+(?:special|beautiful|wonderful)\s+day\b/gi,
		],
		category: 'cliche_opening',
		why: 'This opening states the obvious—everyone knows you\'re standing there today. Jump into the meaningful content.',
		suggestions: [
			'Start with a memory instead',
			'Open with something you love about them',
			'Begin with a promise',
			'Share a moment that defines your relationship',
			'Start with what you\'re feeling right now',
		],
		proofPrompts: [
			'What\'s the first thing you want them to know?',
			'What memory best captures your relationship?',
			'What promise feels most urgent to make?',
		],
		weight: 2,
	},
	{
		key: 'dictionary_definition',
		patterns: [
			/\b(?:webster\'s|the\s+dictionary|merriam-webster)\s+defines\b/gi,
			/\bif\s+you\s+look\s+up\s+(?:love|marriage)\s+in\s+the\s+dictionary\b/gi,
		],
		category: 'cliche_opening',
		why: 'Dictionary definitions are a wedding speech cliché. Your personal definition matters more.',
		suggestions: [
			'Skip the dictionary—share YOUR definition',
			'Describe what love means based on your experience together',
			'Define love through a specific moment you shared',
			'Explain what you\'ve learned about love from them',
		],
		proofPrompts: [
			'What does love mean to YOU now, after knowing them?',
			'How has your understanding of love changed?',
			'What moment taught you something new about love?',
		],
		weight: 3,
	},

	// ============================================================
	// 2) CLICHÉ CLOSINGS (medium-high severity)
	// ============================================================
	{
		key: 'for_rest_of_life',
		patterns: [
			/\bfor\s+the\s+rest\s+of\s+(?:my|our)\s+(?:life|lives)\b/gi,
			/\b(?:until|till)\s+(?:my|our)\s+(?:last|dying)\s+breath\b/gi,
		],
		category: 'cliche_closing',
		why: 'A beautiful sentiment that\'s used so often it can feel generic. Make it concrete.',
		suggestions: [
			'Describe what "the rest of your life" looks like with them',
			'Name specific things you want to do together',
			'Replace with a unique vision of your future',
			'Mention ages: "when we\'re 80 and still..."',
			'Paint a picture of your life at different stages',
		],
		proofPrompts: [
			'What do you picture doing together in 10 years? 40 years?',
			'What daily moments do you want to share forever?',
			'What adventure do you dream of having together?',
		],
		weight: 2,
	},
	{
		key: 'till_death_do_us_part',
		patterns: [
			/\b(?:till|until|\'til)\s+death\s+do\s+us\s+part\b/gi,
			/\bas\s+long\s+as\s+we\s+both\s+shall\s+live\b/gi,
		],
		category: 'cliche_closing',
		why: 'Beautiful traditional language—consider adding a personal detail around it, or making it your own.',
		suggestions: [
			'Keep it and add one personal promise before or after',
			'Modernize it: "until our very last adventure"',
			'Follow it with something specific you\'ll do until then',
			'Pair it with a concrete commitment',
		],
		proofPrompts: [
			'What will you DO every day until then?',
			'What tradition will you keep forever?',
			'What promise feels eternal to you?',
		],
		weight: 1,
	},
	{
		key: 'now_and_forever',
		patterns: [
			/\bnow\s+and\s+(?:forever|always)\b/gi,
			/\btoday\s+and\s+(?:every\s+day\s+)?(?:forever|always)\b/gi,
			/\bforever\s+and\s+(?:ever|always|a\s+day)\b/gi,
		],
		category: 'cliche_closing',
		why: 'These phrases sound nice but don\'t add meaning. Show what forever looks like for you.',
		suggestions: [
			'Replace with a specific daily commitment',
			'Describe your version of "forever"',
			'Name something you\'ll do every single day',
			'Share what your forever includes',
		],
		proofPrompts: [
			'What does forever look like on a Tuesday morning?',
			'What small thing will you do every day?',
			'What does your "always" include?',
		],
		weight: 2,
	},
	{
		key: 'happily_ever_after',
		patterns: [/\bhappily\s+ever\s+after\b/gi],
		category: 'cliche_closing',
		why: 'Fairy tale language that can feel disconnected from real life. Real love includes challenges too.',
		suggestions: [
			'Describe your realistic version of happiness together',
			'Acknowledge that you\'ll face hard times and still choose each other',
			'Replace with something more grounded and personal',
			'Share what happiness with them actually looks like',
		],
		proofPrompts: [
			'What does a happy day with them actually look like?',
			'How do you handle hard times together?',
			'What makes your happiness real, not fairy-tale?',
		],
		weight: 2,
	},

	// ============================================================
	// 3) GENERIC PROMISES (high severity)
	// ============================================================
	{
		key: 'promise_always_love',
		patterns: [
			/\b(?:I|i)\s+promise\s+to\s+(?:always\s+)?love\s+you\b/gi,
			/\b(?:I|i)\s+(?:will|\'ll)\s+(?:always\s+)?love\s+you\b/gi,
			/\b(?:I|i)\s+(?:will|\'ll)\s+never\s+stop\s+loving\s+you\b/gi,
		],
		category: 'generic_promise',
		why: 'Everyone who gets married promises to love. HOW will you love them? Make it specific.',
		suggestions: [
			'Add HOW you\'ll show love daily',
			'Name specific ways you\'ll express love',
			'Describe what loving them looks like in action',
			'Promise something concrete: "I\'ll make your coffee every morning"',
			'Tie your love to a specific behavior or ritual',
		],
		proofPrompts: [
			'How do you show love on a random Tuesday?',
			'What do you do that makes them feel loved?',
			'What\'s a small act of love you\'ll commit to?',
			'What does your love look like in action?',
		],
		weight: 3,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 100 },
	},
	{
		key: 'promise_be_there',
		patterns: [
			/\b(?:I|i)\s+promise\s+to\s+(?:always\s+)?be\s+there\s+(?:for\s+you)?\b/gi,
			/\b(?:I|i)\s+(?:will|\'ll)\s+(?:always\s+)?be\s+(?:there\s+)?(?:for\s+you|by\s+your\s+side)\b/gi,
		],
		category: 'generic_promise',
		why: 'Being there is expected in marriage. Specify WHEN and HOW you\'ll show up.',
		suggestions: [
			'Name specific situations: "when you\'re sick, when you\'re scared, when you fail"',
			'Describe what "being there" looks like for you',
			'Promise something measurable',
			'Add what you\'ll DO when you\'re there',
		],
		proofPrompts: [
			'When have you been there for them already?',
			'What does "being there" mean in hard moments?',
			'What will you do when they need you most?',
		],
		weight: 3,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 100 },
	},
	{
		key: 'promise_support',
		patterns: [
			/\b(?:I|i)\s+promise\s+to\s+(?:always\s+)?support\s+you\b/gi,
			/\b(?:I|i)\s+(?:will|\'ll)\s+(?:always\s+)?support\s+(?:you|your\s+dreams?)\b/gi,
		],
		category: 'generic_promise',
		why: 'Support is vague. What kind of support? In what situations? Be specific.',
		suggestions: [
			'Name their specific dreams you\'ll support',
			'Describe how you\'ll support them (emotionally, practically, financially)',
			'Promise support for something specific they\'re working toward',
			'Give an example of how you\'ve already supported them',
		],
		proofPrompts: [
			'What dream of theirs are you most excited to support?',
			'How have you supported them already?',
			'What specific support do they need from you?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 100 },
	},
	{
		key: 'promise_cherish',
		patterns: [
			/\b(?:I|i)\s+promise\s+to\s+(?:love,?\s+)?(?:honor,?\s+)?(?:and\s+)?cherish\s+you\b/gi,
			/\bto\s+have\s+and\s+to\s+hold\b/gi,
		],
		category: 'generic_promise',
		why: 'Traditional vow language—beautiful, but consider adding something personal alongside it.',
		suggestions: [
			'Keep it and add ONE specific way you\'ll cherish them',
			'Follow traditional language with a personal promise',
			'Define what "cherish" means to YOU',
			'Add a modern promise after the traditional one',
		],
		proofPrompts: [
			'How will you cherish them specifically?',
			'What does honoring them look like day-to-day?',
			'What personal promise would you add?',
		],
		weight: 1,
	},
	{
		key: 'promise_make_happy',
		patterns: [
			/\b(?:I|i)\s+promise\s+to\s+(?:always\s+)?make\s+you\s+happy\b/gi,
			/\b(?:I|i)\s+(?:will|\'ll)\s+(?:always\s+)?(?:try\s+to\s+)?make\s+you\s+happy\b/gi,
		],
		category: 'generic_promise',
		why: 'You can\'t actually make someone happy—that\'s their own work. Promise what you CAN control.',
		suggestions: [
			'Promise specific things that bring them joy',
			'Commit to creating conditions for happiness',
			'Promise to do specific things they love',
			'Replace with: "I\'ll always try to make you laugh"',
		],
		proofPrompts: [
			'What specific things make them smile?',
			'What can you do that brings them joy?',
			'What inside jokes could you reference?',
		],
		weight: 2,
	},
	{
		key: 'good_times_bad',
		patterns: [
			/\bin\s+(?:good\s+times\s+and\s+(?:in\s+)?bad|the\s+good\s+times\s+and\s+the\s+bad)\b/gi,
			/\bthrough\s+(?:thick\s+and\s+thin|good\s+and\s+bad|better\s+and\s+worse)\b/gi,
			/\bfor\s+(?:better\s+or\s+(?:for\s+)?worse|richer\s+or\s+(?:for\s+)?poorer)\b/gi,
		],
		category: 'generic_promise',
		why: 'Traditional language that\'s powerful but well-worn. Add a personal example.',
		suggestions: [
			'Keep it but follow with a specific "bad time" you\'ve weathered',
			'Name an actual challenge you\'ve faced together',
			'Add what you\'ll DO in bad times',
			'Give an example of a hard moment you\'ve already shared',
		],
		proofPrompts: [
			'What\'s the hardest thing you\'ve faced together?',
			'How have you supported each other in bad times?',
			'What challenge are you ready to face together?',
		],
		weight: 1,
	},

	// ============================================================
	// 4) VAGUE ADMIRATION (medium severity)
	// ============================================================
	{
		key: 'you_complete_me',
		patterns: [/\byou\s+complete\s+me\b/gi],
		category: 'vague_admiration',
		why: 'Famous from "Jerry Maguire"—it\'s become a punchline. You were already whole; they ENHANCE you.',
		suggestions: [
			'Replace with what they ADD to your life',
			'Describe how you\'re better with them',
			'Share what they bring out in you',
			'Name what they\'ve helped you become',
			'Explain how life is richer with them',
		],
		proofPrompts: [
			'What part of you has grown because of them?',
			'What do they bring to your life that was missing?',
			'How are you different (better) with them?',
		],
		weight: 3,
	},
	{
		key: 'you_are_my_rock',
		patterns: [
			/\byou\s+are\s+my\s+rock\b/gi,
			/\byou\'re\s+my\s+rock\b/gi,
			/\bmy\s+rock\s+and\s+(?:my\s+)?(?:anchor|foundation)\b/gi,
		],
		category: 'vague_admiration',
		why: 'A very common metaphor. Describe HOW they ground you or a time they steadied you.',
		suggestions: [
			'Give an example of when they were your rock',
			'Describe what they did that felt like stability',
			'Name a specific moment they grounded you',
			'Replace with a less common metaphor that fits them',
		],
		proofPrompts: [
			'When did they keep you grounded?',
			'What did they do that felt like an anchor?',
			'What\'s a specific example of their steadiness?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'partner_in_crime',
		patterns: [
			/\bpartner\s+in\s+crime\b/gi,
			/\bmy\s+partner\s+in\s+(?:crime|adventure|life)\b/gi,
		],
		category: 'vague_admiration',
		why: 'Overused phrase that doesn\'t tell us anything unique about your relationship.',
		suggestions: [
			'Name an actual adventure or "crime" you\'ve done together',
			'Describe your weirdest or most fun shared moment',
			'Replace with a specific inside joke or reference',
			'Tell a mini-story about your partnership',
		],
		proofPrompts: [
			'What\'s the craziest thing you\'ve done together?',
			'What adventure defines your relationship?',
			'What "crime" would only make sense to you two?',
		],
		weight: 2,
	},
	{
		key: 'my_better_half',
		patterns: [
			/\bmy\s+better\s+half\b/gi,
			/\bmy\s+other\s+half\b/gi,
		],
		category: 'vague_admiration',
		why: 'This implies you\'re incomplete alone. You\'re both whole people who chose each other.',
		suggestions: [
			'Replace with what makes them your FAVORITE person',
			'Describe what they bring to the partnership',
			'Name their qualities that complement yours',
			'Explain why you CHOOSE them, not need them',
		],
		proofPrompts: [
			'What makes them your favorite person?',
			'What quality of theirs do you most admire?',
			'How do your differences make you stronger?',
		],
		weight: 2,
	},
	{
		key: 'my_everything',
		patterns: [
			/\byou\s+(?:are|\'re)\s+my\s+everything\b/gi,
			/\byou\s+mean\s+everything\s+to\s+me\b/gi,
			/\bmy\s+whole\s+world\b/gi,
		],
		category: 'vague_admiration',
		why: 'Putting someone on this pedestal is a lot of pressure. Be specific about what they mean to you.',
		suggestions: [
			'List 3-5 specific things they mean to you',
			'Replace with what they actually ARE to you',
			'Describe specific roles they play in your life',
			'Name what they bring that no one else does',
		],
		proofPrompts: [
			'What specific roles do they play in your life?',
			'What do they give you that no one else does?',
			'What are 3 specific things they mean to you?',
		],
		weight: 2,
	},
	{
		key: 'soulmate',
		patterns: [
			/\bmy\s+soulmate\b/gi,
			/\byou\s+(?:are|\'re)\s+my\s+soulmate\b/gi,
			/\bfound\s+my\s+soulmate\b/gi,
		],
		category: 'vague_admiration',
		why: 'Soulmate is a big claim. What makes them YOUR soulmate specifically?',
		suggestions: [
			'Describe what makes your connection unique',
			'Share a moment when you felt this deep connection',
			'Explain what "soulmate" means to you',
			'Give evidence of your soul-level connection',
		],
		proofPrompts: [
			'What moment made you feel this connection?',
			'What do they understand about you without words?',
			'What makes your bond different from others?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'love_of_my_life',
		patterns: [
			/\b(?:the\s+)?love\s+of\s+my\s+life\b/gi,
			/\bmy\s+one\s+true\s+love\b/gi,
		],
		category: 'vague_admiration',
		why: 'A meaningful phrase that\'s used so often it can lose impact. Make it specific.',
		suggestions: [
			'Add WHY they\'re the love of your life',
			'Describe the moment you knew',
			'Give an example of what makes them THE one',
			'Share what sets this love apart',
		],
		proofPrompts: [
			'What makes this love different from any other?',
			'When did you know they were THE love?',
			'What do they do that makes you certain?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'meant_to_be',
		patterns: [
			/\bwe\s+(?:were|are)\s+meant\s+to\s+be\b/gi,
			/\bdestined\s+to\s+be\s+together\b/gi,
			/\bfate\s+brought\s+us\s+together\b/gi,
		],
		category: 'vague_admiration',
		why: 'Fate claims can feel like a cop-out. What CHOICES brought you here?',
		suggestions: [
			'Tell the specific story of how you came together',
			'Acknowledge the choices you both made',
			'Describe the coincidences that connected you',
			'Replace fate with appreciation for the journey',
		],
		proofPrompts: [
			'What choices led you to each other?',
			'What almost didn\'t happen that brought you together?',
			'What decisions did you make to be here today?',
		],
		weight: 2,
	},
	{
		key: 'best_friend',
		patterns: [
			/\byou\s+(?:are|\'re)\s+my\s+best\s+friend\b/gi,
			/\bmarrying\s+my\s+best\s+friend\b/gi,
			/\bnot\s+only\s+my\s+(?:lover|partner)\s+but\s+(?:also\s+)?my\s+best\s+friend\b/gi,
		],
		category: 'vague_admiration',
		why: 'Sweet sentiment that\'s very common. Show what makes them your best friend.',
		suggestions: [
			'Give an example of your friendship in action',
			'Describe what you do as best friends',
			'Share a "best friend" moment',
			'Name what makes them friend-level trusted',
		],
		proofPrompts: [
			'What\'s your favorite thing to do together as friends?',
			'What do you tell them that you don\'t tell anyone else?',
			'When do you have the most fun together?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},

	// ============================================================
	// 5) CRINGE PHRASES (high severity)
	// ============================================================
	{
		key: 'you_had_me_at_hello',
		patterns: [/\byou\s+had\s+me\s+at\s+(?:hello|hi)\b/gi],
		category: 'cringe_phrase',
		why: 'Directly from "Jerry Maguire"—everyone will recognize this movie quote.',
		suggestions: [
			'Describe your ACTUAL first words to each other',
			'Share what they really said that hooked you',
			'Tell the real story of your first conversation',
			'Replace with your authentic first impression',
		],
		proofPrompts: [
			'What did they actually say when you first talked?',
			'What was your real first impression?',
			'What drew you in during that first conversation?',
		],
		weight: 3,
	},
	{
		key: 'you_make_me_want_to_be_better',
		patterns: [/\byou\s+make\s+me\s+(?:want\s+to\s+be\s+)?(?:a\s+)?better\s+(?:person|man|woman)\b/gi],
		category: 'cringe_phrase',
		why: 'From many romantic movies. What specific ways have you actually become better?',
		suggestions: [
			'Name specific ways you\'ve grown',
			'Give an example of something they taught you',
			'Describe a habit or trait you\'ve developed because of them',
			'Share what you\'ve become that you\'re proud of',
		],
		proofPrompts: [
			'What have you actually changed about yourself?',
			'What did they teach you about being a better person?',
			'What growth can you point to specifically?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 100 },
	},
	{
		key: 'love_at_first_sight',
		patterns: [
			/\b(?:it\s+was\s+)?love\s+at\s+first\s+sight\b/gi,
			/\bfell\s+in\s+love\s+(?:at\s+first\s+sight|instantly|immediately)\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A romantic ideal that\'s been claimed countless times. What did you actually feel?',
		suggestions: [
			'Describe what you REALLY felt—curiosity? intrigue? attraction?',
			'Be honest about how love actually developed',
			'Share the real timeline of falling in love',
			'Replace with specific first impressions',
		],
		proofPrompts: [
			'What did you actually feel in that first moment?',
			'When did interest become love?',
			'What was the real progression of your feelings?',
		],
		weight: 2,
	},
	{
		key: 'swept_off_feet',
		patterns: [
			/\bswept\s+(?:me\s+)?off\s+(?:my\s+)?feet\b/gi,
			/\byou\s+swept\s+me\s+off\s+my\s+feet\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A cliché romance phrase. What did they actually DO that amazed you?',
		suggestions: [
			'Describe the specific thing that impressed you',
			'Name the moment or action that wowed you',
			'Share what they did that felt magical',
			'Replace with concrete details',
		],
		proofPrompts: [
			'What specific thing did they do?',
			'What moment made you feel this way?',
			'What surprised you about them?',
		],
		weight: 2,
	},
	{
		key: 'take_breath_away',
		patterns: [
			/\byou\s+(?:still\s+)?take\s+my\s+breath\s+away\b/gi,
			/\btakes?\s+my\s+breath\s+away\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A phrase so common it\'s lost specificity. When specifically does this happen?',
		suggestions: [
			'Describe a specific moment when you felt this',
			'Name what they do that creates this feeling',
			'Give an example: "When you laugh at your own jokes..."',
			'Replace with a unique observation about them',
		],
		proofPrompts: [
			'When specifically do you feel breathless?',
			'What do they do that creates this reaction?',
			'What\'s a recent moment when this happened?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'cant_live_without',
		patterns: [
			/\b(?:I|i)\s+can\'?t\s+(?:live|imagine\s+(?:my\s+)?life)\s+without\s+you\b/gi,
			/\b(?:I|i)\s+(?:don\'?t|couldn\'?t)\s+want\s+to\s+live\s+without\s+you\b/gi,
		],
		category: 'cringe_phrase',
		why: 'Creates a sense of desperation/dependency. You CAN live without them—you CHOOSE them.',
		suggestions: [
			'Replace with "I choose you every day"',
			'Describe what life with them adds',
			'Share why you don\'t WANT to live without them',
			'Focus on choice, not dependency',
		],
		proofPrompts: [
			'Why do you CHOOSE them?',
			'What does life with them offer?',
			'What would you miss most without them?',
		],
		weight: 2,
	},
	{
		key: 'two_hearts_one',
		patterns: [
			/\btwo\s+hearts?\s+(?:beat(?:ing)?\s+as\s+)?one\b/gi,
			/\btwo\s+(?:souls?|people)\s+(?:become|becoming)\s+one\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A poetic idea that\'s become a cliché. You\'re two people—celebrate that.',
		suggestions: [
			'Describe how your differences complement each other',
			'Share what makes your partnership strong',
			'Explain how two whole people create something new together',
			'Focus on connection, not merging',
		],
		proofPrompts: [
			'How are you different in ways that work?',
			'What do you create together?',
			'How does your partnership make you both better?',
		],
		weight: 2,
	},
	{
		key: 'light_of_my_life',
		patterns: [
			/\b(?:the\s+)?light\s+of\s+my\s+life\b/gi,
			/\byou\s+light\s+up\s+my\s+(?:life|world)\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A sweet metaphor that\'s very well-worn. How do they actually brighten things?',
		suggestions: [
			'Describe HOW they bring light to your days',
			'Give an example of them brightening a hard moment',
			'Replace with specific ways they improve your mood',
			'Name what they do that feels like sunshine',
		],
		proofPrompts: [
			'What do they do that brightens your day?',
			'When have they lifted you out of darkness?',
			'What specifically makes them your "light"?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},

	// ============================================================
	// 6) FILLER INTENSIFIERS (low severity)
	// ============================================================
	{
		key: 'so_very_much',
		patterns: [
			/\bso\s+(?:very\s+)?much\b/gi,
			/\bvery\s+(?:very\s+)?much\b/gi,
		],
		category: 'filler_intensifier',
		why: 'Empty emphasis that doesn\'t add meaning. Show how much instead.',
		suggestions: [
			'Replace with a specific example',
			'Show the "much" through action',
			'Remove and let the statement stand',
			'Add evidence instead of intensifiers',
		],
		proofPrompts: [
			'How can you show this intensity?',
			'What example proves "how much"?',
		],
		weight: 1,
	},
	{
		key: 'truly_deeply',
		patterns: [
			/\btruly\b/gi,
			/\bdeeply\b/gi,
			/\btruly,?\s+(?:madly,?\s+)?deeply\b/gi,
		],
		category: 'filler_intensifier',
		why: 'These intensifiers often weaken rather than strengthen. Show depth through examples.',
		suggestions: [
			'Remove and add a concrete example instead',
			'Replace with evidence of depth',
			'Show, don\'t tell, how deep the feeling is',
		],
		proofPrompts: [
			'What makes this feeling deep?',
			'How can you show this truth?',
		],
		weight: 1,
	},
	{
		key: 'completely_totally',
		patterns: [
			/\bcompletely\b/gi,
			/\btotally\b/gi,
			/\babsolutely\b/gi,
			/\butterly\b/gi,
		],
		category: 'filler_intensifier',
		why: 'Absolute intensifiers often ring hollow. Be specific about what you mean.',
		suggestions: [
			'Remove and strengthen the underlying statement',
			'Replace with concrete evidence',
			'Let actions speak louder than intensifiers',
		],
		proofPrompts: [
			'What example proves this absolute?',
			'How can you show this completely?',
		],
		weight: 1,
	},
	{
		key: 'with_all_my_heart',
		patterns: [
			/\bwith\s+all\s+(?:of\s+)?my\s+heart\b/gi,
			/\bfrom\s+the\s+bottom\s+of\s+my\s+heart\b/gi,
		],
		category: 'filler_intensifier',
		why: 'A sincere phrase that\'s become formulaic. How else can you show this sincerity?',
		suggestions: [
			'Replace with a physical description of the feeling',
			'Describe what your heart actually does when you see them',
			'Add a specific moment when you felt this',
			'Show the feeling through action or example',
		],
		proofPrompts: [
			'What does your heart actually feel?',
			'When have you felt this most intensely?',
		],
		weight: 1,
	},

	// ============================================================
	// 7) OVERPROMISE/ABSOLUTES (medium severity)
	// ============================================================
	{
		key: 'always',
		patterns: [/\b(?:I|i)\s+(?:will\s+)?always\b/gi],
		category: 'overpromise_absolute',
		why: '"Always" is a big promise. Consider being honest that you\'ll try, or be specific about what.',
		suggestions: [
			'Replace with "I will strive to" or "I commit to"',
			'Be specific about WHAT you\'ll always do',
			'Acknowledge that always is aspirational',
			'Follow "always" with something concrete and achievable',
		],
		proofPrompts: [
			'What specifically will you always do?',
			'Is this something you can realistically commit to forever?',
			'How will you maintain this "always"?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 60 },
	},
	{
		key: 'never',
		patterns: [/\b(?:I|i)\s+(?:will\s+)?never\b/gi],
		category: 'overpromise_absolute',
		why: '"Never" is almost impossible to keep. Consider what you\'re realistically promising.',
		suggestions: [
			'Replace with a realistic commitment',
			'Acknowledge human imperfection',
			'Promise to try or to repair when you fail',
			'Be specific about what you\'re committing to avoid',
		],
		proofPrompts: [
			'Is "never" realistic?',
			'What will you do if you break this promise?',
			'Can you rephrase as a positive commitment?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 60 },
	},
	{
		key: 'perfect',
		patterns: [
			/\byou\'?re?\s+(?:so\s+)?perfect\b/gi,
			/\bmy\s+perfect\s+(?:match|partner|person)\b/gi,
			/\bperfect\s+for\s+(?:me|each\s+other)\b/gi,
		],
		category: 'overpromise_absolute',
		why: 'No one is perfect. Loving their imperfections is more meaningful.',
		suggestions: [
			'Acknowledge their imperfections and love them anyway',
			'Replace with "you\'re perfect for ME because..."',
			'Describe what makes them right for you specifically',
			'Celebrate their quirks and flaws',
		],
		proofPrompts: [
			'What imperfections do you love about them?',
			'What makes them perfect FOR YOU (not objectively)?',
			'What quirk of theirs do you find endearing?',
		],
		weight: 2,
	},
	{
		key: 'everything_nothing',
		patterns: [
			/\byou\s+(?:are|mean)\s+everything\b/gi,
			/\bnothing\s+(?:else\s+)?matters\b/gi,
			/\bwithout\s+you[,]?\s+nothing\b/gi,
		],
		category: 'overpromise_absolute',
		why: 'Absolute language can feel overwhelming. Be specific about what matters.',
		suggestions: [
			'List 3-5 specific things they mean to you',
			'Describe what matters MOST, not "everything"',
			'Balance with realistic acknowledgments',
			'Replace with concrete examples',
		],
		proofPrompts: [
			'What specifically matters most?',
			'What are the top things they mean to you?',
			'How can you be more specific?',
		],
		weight: 2,
	},

	// ============================================================
	// 8) TOO FORMAL/SCRIPTED (low severity)
	// ============================================================
	{
		key: 'dearly_beloved',
		patterns: [
			/\bdearly\s+beloved\b/gi,
			/\bwe\s+are\s+gathered\s+here\s+today\b/gi,
		],
		category: 'too_formal_scripted',
		why: 'This is the officiant\'s line, not yours! Your vows should sound like you.',
		suggestions: [
			'Start with something that sounds like you',
			'Open with a memory or feeling',
			'Skip the formalities and speak from the heart',
			'Begin with what you want them to know',
		],
		proofPrompts: [
			'How would you start if you were just talking to them?',
			'What\'s the first thing you want to say?',
		],
		weight: 2,
	},
	{
		key: 'hereby_declare',
		patterns: [
			/\b(?:I|i)\s+(?:hereby\s+)?(?:declare|pronounce|affirm)\b/gi,
			/\blet\s+it\s+be\s+known\b/gi,
		],
		category: 'too_formal_scripted',
		why: 'Legalistic language that doesn\'t fit intimate vows. Speak naturally.',
		suggestions: [
			'Replace with natural, conversational language',
			'Just say what you mean directly',
			'Speak as you would to them alone',
		],
		proofPrompts: [
			'How would you say this casually?',
			'What\'s the simpler way to express this?',
		],
		weight: 2,
	},
	{
		key: 'on_this_day',
		patterns: [
			/\bon\s+this\s+(?:day|occasion|special\s+day)\b/gi,
			/\bin\s+the\s+presence\s+of\s+(?:these\s+)?(?:witnesses|loved\s+ones|family\s+and\s+friends)\b/gi,
		],
		category: 'too_formal_scripted',
		why: 'Formal phrasing that sounds like a script. Be more conversational.',
		suggestions: [
			'Remove and get to the content',
			'Replace with something personal',
			'Start with what you want to say, not the setting',
		],
		proofPrompts: [
			'What do you actually want to say?',
			'Can you skip to the meaningful part?',
		],
		weight: 1,
	},
	{
		key: 'henceforth_thereafter',
		patterns: [
			/\bhenceforth\b/gi,
			/\bthereafter\b/gi,
			/\bwhereupon\b/gi,
			/\bwhereby\b/gi,
		],
		category: 'too_formal_scripted',
		why: 'Medieval language that will feel out of place. Use modern words.',
		suggestions: [
			'Replace with "from now on"',
			'Use "going forward" or "from today"',
			'Speak in your normal voice',
		],
		proofPrompts: [
			'How would you say this normally?',
		],
		weight: 2,
	},

	// ============================================================
	// MORE CLICHÉS AND COMMON PHRASES
	// ============================================================
	{
		key: 'butterflies',
		patterns: [
			/\byou\s+(?:still\s+)?give\s+me\s+butterflies\b/gi,
			/\bbutterflies\s+in\s+my\s+stomach\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A common way to describe attraction. Describe YOUR physical feelings.',
		suggestions: [
			'Describe what you actually feel physically',
			'Name the specific situation that causes this',
			'Replace with your unique way of describing nervousness/excitement',
		],
		proofPrompts: [
			'What do you actually feel when you see them?',
			'When do you feel most nervous around them still?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'through_everything',
		patterns: [
			/\bthrough\s+(?:it\s+all|everything)\b/gi,
			/\bno\s+matter\s+what\s+(?:happens|comes)\b/gi,
		],
		category: 'generic_promise',
		why: '"Everything" is vague. Name some of the "everything" you\'ve faced or will face.',
		suggestions: [
			'List specific challenges you\'ve weathered',
			'Name potential future challenges',
			'Be specific about what "everything" includes',
		],
		proofPrompts: [
			'What challenges have you already faced together?',
			'What do you anticipate facing together?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'grow_old_together',
		patterns: [
			/\bgrow(?:ing)?\s+old\s+(?:together|with\s+you)\b/gi,
			/\bspend\s+(?:the\s+rest\s+of\s+)?(?:my|our)\s+(?:life|lives|days)\s+(?:together|with\s+you)\b/gi,
		],
		category: 'cliche_closing',
		why: 'A beautiful goal that\'s expressed in most vows. Make it vivid.',
		suggestions: [
			'Describe what growing old together looks like',
			'Picture a specific scene of your future',
			'Add details: "sitting on a porch in matching rockers"',
			'Name what you\'ll do in old age together',
		],
		proofPrompts: [
			'What do you picture at 70? At 90?',
			'What tradition will you still keep in old age?',
			'What does your old-age love look like?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 100 },
	},
	{
		key: 'love_you_more',
		patterns: [
			/\b(?:I|i)\s+(?:will\s+)?love\s+you\s+more\s+(?:each|every)\s+day\b/gi,
			/\bmy\s+love\s+(?:for\s+you\s+)?grows?\s+(?:every|each)\s+day\b/gi,
		],
		category: 'generic_promise',
		why: 'A nice sentiment that\'s common in vows. Show how your love has grown.',
		suggestions: [
			'Give an example of how love has already grown',
			'Describe a moment when you felt love deepen',
			'Replace with specific ways you\'ll nurture love',
		],
		proofPrompts: [
			'When did you feel love grow?',
			'How has your love changed since you met?',
			'What do you do to nurture your love?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'i_do',
		patterns: [/\b(?:I|i)\s+do\b/gi],
		category: 'too_formal_scripted',
		why: 'This is usually the answer to the officiant\'s question, not part of your vows.',
		suggestions: [
			'Save this for when the officiant asks',
			'In your vows, say what you\'re committing to',
			'Be more specific than "I do"',
		],
		proofPrompts: [
			'What specifically are you saying "I do" to?',
		],
		weight: 1,
	},
	{
		key: 'honor_respect',
		patterns: [
			/\b(?:I|i)\s+(?:will\s+)?(?:promise\s+to\s+)?honor\s+(?:and\s+)?respect\s+you\b/gi,
			/\bto\s+love,?\s+honor,?\s+(?:and\s+)?(?:cherish|obey)\b/gi,
		],
		category: 'generic_promise',
		why: 'Traditional language that can feel formal. Add how you\'ll show honor and respect.',
		suggestions: [
			'Describe what honoring them looks like daily',
			'Give an example of showing respect',
			'Add a personal promise alongside the traditional',
		],
		proofPrompts: [
			'How do you show respect in your relationship?',
			'What does honoring them mean to you?',
		],
		weight: 1,
	},
	{
		key: 'journey_together',
		patterns: [
			/\b(?:this\s+)?journey\s+(?:together|we\'?re?\s+on)\b/gi,
			/\b(?:life\'?s?\s+)?adventure\s+(?:together|with\s+you)\b/gi,
		],
		category: 'vague_admiration',
		why: '"Journey" and "adventure" are generic. Name specific adventures you\'ve had or want.',
		suggestions: [
			'Replace with a specific trip or experience',
			'Name an adventure you want to have together',
			'Describe what your journey has included',
		],
		proofPrompts: [
			'What\'s been your favorite adventure so far?',
			'What journey are you excited to take together?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'lucky_blessed',
		patterns: [
			/\b(?:I\'?m|I\s+am)\s+(?:so\s+)?(?:lucky|blessed|fortunate)\s+(?:to\s+(?:have|marry)\s+you)?\b/gi,
			/\b(?:the\s+)?luckiest\s+(?:person|man|woman)\b/gi,
		],
		category: 'vague_admiration',
		why: 'A common expression of gratitude. WHY do you feel lucky?',
		suggestions: [
			'Name specific things that make you feel lucky',
			'Describe what they do that\'s lucky-making',
			'Give an example of a lucky moment',
		],
		proofPrompts: [
			'What specifically makes you feel lucky?',
			'What do they do that others don\'t?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'dreamed_of',
		patterns: [
			/\b(?:I\'?ve|I\s+have)\s+(?:always\s+)?dreamed?\s+of\s+(?:this|someone\s+like\s+you)\b/gi,
			/\byou\'?re?\s+(?:everything\s+)?(?:I\'?ve|I\s+have)\s+(?:ever\s+)?dreamed?\s+(?:of|about)\b/gi,
		],
		category: 'cringe_phrase',
		why: 'Dreams are nice but vague. What specifically did you dream of that they fulfill?',
		suggestions: [
			'Describe specific dreams they\'ve made real',
			'Name what you hoped for that they provide',
			'Replace with concrete ways they exceed expectations',
		],
		proofPrompts: [
			'What did you actually dream of in a partner?',
			'How do they match or exceed those dreams?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'i_cant_wait',
		patterns: [
			/\b(?:I|i)\s+can\'?t\s+wait\s+(?:to|for)\b/gi,
			/\b(?:I\'?m|I\s+am)\s+(?:so\s+)?excited\s+(?:to|for)\b/gi,
		],
		category: 'filler_intensifier',
		why: 'A filler phrase that\'s better replaced with what you\'re actually excited for.',
		suggestions: [
			'Just say what you\'re excited about',
			'Remove "I can\'t wait" and state the thing',
			'Add specifics about why you\'re excited',
		],
		proofPrompts: [
			'What specifically are you excited for?',
		],
		weight: 1,
	},
	{
		key: 'fill_my_heart',
		patterns: [
			/\byou\s+fill\s+my\s+(?:heart|life)\s+(?:with\s+(?:joy|love|happiness))?\b/gi,
			/\b(?:my\s+)?heart\s+(?:is\s+)?(?:full|overflowing)\b/gi,
		],
		category: 'cringe_phrase',
		why: 'A poetic image that\'s become clichéd. What do they actually fill your life with?',
		suggestions: [
			'Name specific things they bring to your life',
			'Describe actual moments of joy they create',
			'Replace with concrete examples',
		],
		proofPrompts: [
			'What specifically do they bring to your daily life?',
			'What\'s an example of them filling your life?',
		],
		weight: 2,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'cant_imagine',
		patterns: [/\b(?:I|i)\s+(?:can\'?t|cannot)\s+imagine\s+(?:my\s+)?life\s+without\s+you\b/gi],
		category: 'cringe_phrase',
		why: 'You lived a full life before them—you CAN imagine it. You CHOOSE not to.',
		suggestions: [
			'Replace with why you CHOOSE them',
			'Describe what life with them offers',
			'Focus on what they add, not what you\'d lack',
		],
		proofPrompts: [
			'Why do you choose life WITH them?',
			'What does life with them include?',
		],
		weight: 2,
	},
	{
		key: 'eyes_met',
		patterns: [
			/\bour\s+eyes\s+met\b/gi,
			/\bwhen\s+(?:I|i)\s+(?:first\s+)?looked\s+into\s+your\s+eyes\b/gi,
		],
		category: 'cliche_opening',
		why: 'A romantic trope—what actually happened when you first saw each other?',
		suggestions: [
			'Describe what you actually saw/felt',
			'Tell the real story of noticing each other',
			'Replace with authentic first impression',
		],
		proofPrompts: [
			'What was really happening when you first looked at each other?',
			'What did you notice first?',
		],
		weight: 1,
		conditionalRule: { type: 'requires-no-specificity', windowChars: 80 },
	},
	{
		key: 'in_sickness_health',
		patterns: [/\bin\s+sickness\s+and\s+(?:in\s+)?health\b/gi],
		category: 'generic_promise',
		why: 'Beautiful traditional language—consider adding a personal commitment alongside it.',
		suggestions: [
			'Keep it and add how you\'ll show up in sickness',
			'Share a time you\'ve already supported them when sick',
			'Add a specific promise about caring for them',
		],
		proofPrompts: [
			'How have you cared for them when they were sick?',
			'What will you do when they\'re not at their best?',
		],
		weight: 1,
	},
	{
		key: 'love_more_words',
		patterns: [
			/\b(?:I|i)\s+love\s+you\s+more\s+than\s+words\s+(?:can|could)\s+(?:say|express)\b/gi,
			/\bwords\s+(?:can\'?t|cannot|don\'?t)\s+(?:express|describe)\b/gi,
		],
		category: 'cringe_phrase',
		why: 'If words can\'t express it, show it! But actually, you\'re giving a speech, so find the words.',
		suggestions: [
			'Try to find the words anyway—that\'s the point of vows',
			'Use actions and examples to show depth',
			'Describe feelings through metaphor or memory',
		],
		proofPrompts: [
			'What words come closest?',
			'What memory shows the depth of your love?',
		],
		weight: 2,
	},
]

/**
 * Index the lexicon by key for quick lookup.
 */
export const lexiconByKey: Map<string, VowLexiconItem> = new Map(
	vowLexicon.map((item) => [item.key, item])
)

/**
 * Get all patterns sorted by pattern length (longest first) for matching.
 * This is used by the matcher to ensure longest-match-first behavior.
 */
export function getSortedPatterns(): Array<{ item: VowLexiconItem; pattern: RegExp }> {
	const result: Array<{ item: VowLexiconItem; pattern: RegExp }> = []

	for (const item of vowLexicon) {
		for (const pattern of item.patterns) {
			result.push({ item, pattern })
		}
	}

	// Sort by pattern source length (descending) to match longer patterns first
	result.sort((a, b) => b.pattern.source.length - a.pattern.source.length)

	return result
}
