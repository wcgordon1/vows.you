/**
 * Sentence banks for the Wedding Vows Template generator.
 * Organized by tone with multiple options for variety.
 */

import type { VowTone, ClosingStyle, PromiseSuggestion } from './types'

/** Opening lines by tone */
export const openings: Record<VowTone, string[]> = {
	heartfelt: [
		'Standing here with you today, I feel like the luckiest person alive.',
		'When I look at you, I see my whole future, and it takes my breath away.',
		'I never knew what love truly meant until I met you.',
		'Today, I get to marry my favorite person in the world.',
		'There are a million things I could say to you right now, but I want to start with this: you are my home.',
	],
	'modern-minimal': [
		'Here we are. You and me. This is it.',
		"I'm not great with big speeches, but I'm great at loving you.",
		"Before I met you, I didn't know what I was looking for. Now I do.",
		"Today, I choose you. And I'll keep choosing you.",
		'You make sense to me in a way no one else ever has.',
	],
	'funny-light': [
		"I knew I wanted to marry you when you laughed at my worst jokes. That takes commitment.",
		"Let's be honest: I practiced this speech way too many times in the mirror.",
		"I never thought I'd find someone willing to put up with me. And yet, here you are.",
		"When we first met, I thought you were way out of my league. I still think that, honestly.",
		"I wrote these vows at midnight, then rewrote them at 3am, then again this morning. You're worth every draft.",
	],
}

/** Transition phrases for the story section */
export const storyTransitions: Record<VowTone, string[]> = {
	heartfelt: [
		'From the moment we met,',
		'I still remember',
		'Looking back,',
		'Our story began',
		'When I first saw you,',
	],
	'modern-minimal': [
		'We met',
		'It started',
		'That first time,',
		'The day we met,',
		'From day one,',
	],
	'funny-light': [
		'The way we met was',
		"I'll never forget when",
		'So there I was,',
		'Little did I know,',
		'Plot twist:',
	],
}

/** Admiration connectors */
export const admirationConnectors: Record<VowTone, string[]> = {
	heartfelt: [
		'What I love most about you is',
		'You have this incredible way of',
		'One of the things I admire most is',
		"I'm constantly amazed by",
		'You inspire me because',
	],
	'modern-minimal': [
		'I love that you',
		"You're the kind of person who",
		'What gets me is',
		'I respect that you',
		'You just',
	],
	'funny-light': [
		"Somehow, you manage to",
		"I don't know how you do it, but",
		"Against all odds, you",
		"It's honestly impressive how you",
		"Only you could",
	],
}

/** Meaning lines - what they mean to the writer */
export const meaningLines: Record<VowTone, string[]> = {
	heartfelt: [
		'You are my safe place, my greatest adventure, and my best friend.',
		"With you, I've found a love I didn't know was possible.",
		'You make me want to be the best version of myself.',
		"In you, I've found everything I never knew I was missing.",
		"You've shown me what it means to truly be loved.",
	],
	'modern-minimal': [
		"You're it for me.",
		'You make everything better.',
		'Life just works better with you in it.',
		"You're my person.",
		"With you, I'm home.",
	],
	'funny-light': [
		"You're stuck with me now, and honestly, that's your own fault.",
		"You've seen me at my worst and still decided to sign up for this.",
		"I can't imagine doing life with anyone else—mostly because no one else would have me.",
		"You get me, weird habits and all, and that's pretty rare.",
		"Thanks for loving me even when I'm very, very wrong about things.",
	],
}

/** Filler meaning sentences (for padding if under 280 words) */
export const fillerMeaning: string[] = [
	'Every day with you is a gift.',
	'You make ordinary moments feel extraordinary.',
	"I'm so grateful our paths crossed.",
	'Being with you feels effortless.',
	"You've changed my life in the best way.",
]

/** Promise starters */
export const promiseStarters: Record<VowTone, string[]> = {
	heartfelt: [
		'I promise to',
		'I vow to',
		'I commit to',
		'I will always',
		'I pledge to',
	],
	'modern-minimal': [
		'I promise to',
		"I'll",
		'I will',
		"I'm going to",
		'I promise',
	],
	'funny-light': [
		'I promise to',
		"I'll try my best to",
		"I solemnly swear I'll",
		'I hereby promise to',
		"I'll do my best to",
	],
}

/** Promise suggestions for multi-select */
export const promiseSuggestions: PromiseSuggestion[] = [
	{ key: 'listen', text: 'listen to you, even when I think I already know the answer' },
	{ key: 'support', text: 'support your dreams as if they were my own' },
	{ key: 'laugh', text: 'find reasons to laugh with you every single day' },
	{ key: 'patient', text: 'be patient with you, even on the hard days' },
	{ key: 'adventure', text: 'choose adventure with you over comfort without you' },
	{ key: 'honest', text: 'be honest with you, always' },
	{ key: 'grow', text: 'grow alongside you, not apart from you' },
	{ key: 'celebrate', text: "celebrate your wins like they're my own" },
	{ key: 'team', text: 'be on your team, no matter what' },
	{ key: 'forgive', text: 'forgive quickly and love deeply' },
	{ key: 'present', text: 'be present, not just physically but emotionally' },
	{ key: 'hard-days', text: 'hold your hand through the hard days' },
	{ key: 'best-friend', text: 'be your best friend, always' },
	{ key: 'respect', text: 'respect you, your space, and your needs' },
	{ key: 'home', text: 'make wherever we are feel like home' },
]

/** Humor lines (safe, light, not roast-y) */
export const humorLines: string[] = [
	"I promise to only steal the covers sometimes.",
	"I'll try not to finish your sentences—but no guarantees.",
	"I vow to laugh at your jokes, even the ones that aren't funny.",
	"I promise to always let you pick the movie—okay, most of the time.",
	"I'll do my best to remember to take out the trash before you ask.",
	"I promise to never judge your questionable snack combinations.",
	"I vow to be your biggest fan, even when you're being ridiculous.",
	"I'll try to be on time. I said try.",
]

/** Closing lines by style */
export const closings: Record<ClosingStyle, Record<VowTone, string[]>> = {
	classic: {
		heartfelt: [
			'I give you my heart, today and always.',
			'With all that I am and all that I have, I honor you.',
			'I choose you, today and every day that follows.',
		],
		'modern-minimal': [
			"That's it. You're my forever.",
			'I choose you. Always.',
			"Here's to us.",
		],
		'funny-light': [
			"So yeah, you're stuck with me. Lucky you.",
			"Let's do this thing. Together. Forever.",
			"I'm all in. No take-backs.",
		],
	},
	'forward-looking': {
		heartfelt: [
			"I can't wait to build a life with you, one beautiful day at a time.",
			"Our best days are still ahead, and I'm so excited to live them with you.",
			"Whatever the future holds, I know we'll face it together.",
		],
		'modern-minimal': [
			"Let's build something amazing.",
			"Here's to what's next.",
			"The best is yet to come.",
		],
		'funny-light': [
			"I have no idea what we're doing, but I'm glad we're doing it together.",
			"Can't wait to see what kind of trouble we get into next.",
			"Here's to a lifetime of making it up as we go.",
		],
	},
	'simple-sweet': {
		heartfelt: [
			'I love you. I always will.',
			'You are my everything.',
			'Forever and always, my love.',
		],
		'modern-minimal': [
			'I love you.',
			"You're my favorite.",
			'Always.',
		],
		'funny-light': [
			'Love you. Mean it.',
			"You're alright, I guess. Just kidding—you're everything.",
			"I like you a lot. Like, a lot a lot.",
		],
	},
	poetic: {
		heartfelt: [
			'In your eyes, I have found my home. In your heart, I have found my love.',
			'You are the answer to every prayer my heart has ever whispered.',
			'With you, every ending is just a new beginning.',
		],
		'modern-minimal': [
			'You are my calm in the chaos.',
			"In you, I found what I didn't know I was searching for.",
			"You're my favorite story.",
		],
		'funny-light': [
			"You're the plot twist I never saw coming—and I love it.",
			"Life's weird, but it's less weird with you.",
			"You're my favorite chapter.",
		],
	},
	grounded: {
		heartfelt: [
			"I don't need a fairy tale. I just need you.",
			"Real love isn't perfect, and that's what makes it beautiful. I choose you.",
			"Through all of life's ups and downs, I will be right here beside you.",
		],
		'modern-minimal': [
			"I don't need grand gestures. I just need you.",
			"It's simple: I love you, and I'm not going anywhere.",
			"You and me. That's all I need.",
		],
		'funny-light': [
			"Marriage won't always be easy, but at least we'll have snacks.",
			"I know life isn't a movie, but I'd watch a movie about us.",
			"We might not have it all figured out, but we've got each other.",
		],
	},
}

/** Get closing options for display in the picker */
export const closingOptions: { key: ClosingStyle; label: string }[] = [
	{ key: 'classic', label: 'Classic & Timeless' },
	{ key: 'forward-looking', label: 'Forward-Looking' },
	{ key: 'simple-sweet', label: 'Simple & Sweet' },
	{ key: 'poetic', label: 'Poetic & Romantic' },
	{ key: 'grounded', label: 'Grounded & Real' },
]
