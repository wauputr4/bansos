// Small, safe Markdown subset for repository-controlled contributor profiles.
/** @param {string} source */
export function renderProfileMarkdown(source) {
	/** @param {string} text */
	const inline = (text) =>
		text
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/`([^`]+)`/g, '<code>$1</code>');

	let html = '';
	let inList = false;
	const closeList = () => {
		if (!inList) return;
		html += '</ul>';
		inList = false;
	};

	for (const rawLine of source.trim().split('\n')) {
		const line = rawLine.trim();
		if (!line) {
			closeList();
			continue;
		}
		const heading = line.match(/^(#{1,3})\s+(.+)$/);
		if (heading) {
			closeList();
			if (heading[1] !== '#') html += `<h2>${inline(heading[2])}</h2>`;
			continue;
		}
		const item = line.match(/^[-*]\s+(.+)$/);
		if (item) {
			if (!inList) html += '<ul>';
			inList = true;
			html += `<li>${inline(item[1])}</li>`;
			continue;
		}
		closeList();
		html += `<p>${inline(line)}</p>`;
	}
	closeList();
	return html;
}
