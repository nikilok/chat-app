export default function isEmoji(str: string): boolean {
	if (!str || str.length === 0) {
		return false;
	}

	const trimmed = str.trim();
	/*
    Check if the string contains only emoji characters
    This regex matches comprehensive emoji Unicode ranges:
    - Emoticons (U+1F600-U+1F64F)
    - Miscellaneous Symbols and Pictographs (U+1F300-U+1F5FF)
    - Transport and Map (U+1F680-U+1F6FF)
    - Regional Indicator (U+1F1E0-U+1F1FF)
    - Supplemental Symbols and Pictographs (U+1F900-U+1F9FF)
    - Miscellaneous Symbols (U+2600-U+26FF)
    - Dingbats (U+2700-U+27BF)
    - Variation Selectors (U+FE0F)
    - Zero Width Joiner (U+200D)
    - Skin tone modifiers (U+1F3FB-U+1F3FF)
    - Additional symbols and arrows
    */
	const emojiRegex =
		/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1FA82}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F018}-\u{1F270}\u{238C}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]+$/u;

	return emojiRegex.test(trimmed);
}
