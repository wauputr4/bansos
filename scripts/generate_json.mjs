import fs from 'fs';

const text = fs.readFileSync('src/lib/data/bansos.ts', 'utf8');
const match = text.match(/export const bansosList: BansosItem\[\] = (\[[\s\S]*?\n\]);/);
if (match) {
	const fn = new Function(`return ${match[1]}`);
	const data = fn();
	fs.writeFileSync('src/lib/data/bansos.json', JSON.stringify(data, null, '\t') + '\n');
	console.log('Success');
} else {
	console.log('No match');
}
