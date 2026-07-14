#!/usr/bin/env python3
"""Fix contributorSlug references in bansos index.json and regenerate READMEs."""
import json
import os

BANSOS_DIR = 'src/lib/data/bansos'

# Fix contributorSlug references
updates = {
    'tokenrouter-model-gateway': 'mikacend',
    'freebuff-ai-builder': 'mikaelaldy',
    'idwebhost-domain-gratis-1tahun': 'aziz-budi-satrio'
}

def generate_readme(item):
    """Generate README.md from bansos index.json data."""
    status_emoji = {'active': '✅', 'expired': '❌', 'upcoming': '⏳'}
    emoji = status_emoji.get(item.get('status', ''), '📦')

    lines = []
    lines.append(f"# {emoji} {item['title']}")
    lines.append("")
    provider = item.get('provider', '')
    if item.get('providerWebsiteUrl'):
        lines.append(f"**Provider:** [{provider}]({item['providerWebsiteUrl']})")
    else:
        lines.append(f"**Provider:** {provider}")
    lines.append("")
    lines.append(item.get('description', ''))
    lines.append("")
    status = item.get('status', 'unknown')
    status_text = {'active': 'Aktif', 'expired': 'Kadaluwarsa', 'upcoming': 'Segera Hadir'}
    lines.append(f"> **Status:** {status_text.get(status, status)}")
    lines.append("")
    validity = item.get('validity', {})
    if validity.get('type') == 'fixed' and validity.get('date'):
        lines.append(f"⏰ **Berlaku sampai:** {validity['date']}")
        lines.append("")
    elif validity.get('description'):
        lines.append(f"⏰ **Info Waktu:** {validity['description']}")
        lines.append("")
    if item.get('promoCode'):
        lines.append(f"🏷️ **Promo Code:** `{item['promoCode']}`")
        lines.append("")
    benefits = item.get('benefits', [])
    if benefits:
        lines.append("## Keuntungan")
        lines.append("")
        for b in benefits:
            lines.append(f"- {b}")
        lines.append("")
    reqs = item.get('requirements', [])
    if reqs:
        lines.append("## Persyaratan")
        lines.append("")
        for r in reqs:
            lines.append(f"- {r}")
        lines.append("")
    if item.get('tips'):
        lines.append("## Tips")
        lines.append("")
        lines.append(item['tips'])
        lines.append("")
    if item.get('ctaLink'):
        lines.append("---")
        lines.append("")
        lines.append(f"[🔗 Klaim Bansos Ini]({item['ctaLink']})")
        lines.append("")
    tags = item.get('tags', [])
    if tags:
        lines.append("")
        lines.append(f"🏷️ Tags: {' · '.join(tags)}")
        lines.append("")
    if item.get('contributorSlug'):
        lines.append("")
        lines.append(f"✏️ Dikontribusikan oleh `{item['contributorSlug']}`")
        lines.append("")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*[bansos.dev](https://bansos.dev) — Open Source Catalog*")
    return "\n".join(lines)

for slug, contrib_slug in updates.items():
    idx_path = os.path.join(BANSOS_DIR, slug, 'index.json')
    readme_path = os.path.join(BANSOS_DIR, slug, 'README.md')
    if os.path.exists(idx_path):
        idx = json.load(open(idx_path))
        idx['contributorSlug'] = contrib_slug
        with open(idx_path, 'w') as f:
            json.dump(idx, f, indent=4, ensure_ascii=False)
        # Regenerate README
        readme = generate_readme(idx)
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme)
        print(f"✅ {slug}/index.json + README.md fixed (→ {contrib_slug})")

print("\n✔️ Done!")
