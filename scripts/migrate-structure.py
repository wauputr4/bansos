#!/usr/bin/env python3
"""
Migration script: bansos.json + commit-contributors.json → folder structure

src/lib/data/
├── bansos/<slug>/
│   ├── index.json
│   └── README.md
├── contributors/<login>/
│   └── manifest.json
└── index.json (generated - lightweight listing)
"""

import json
import os
import re
import shutil
from datetime import date

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO, 'src', 'lib', 'data')
BANSOS_DIR = os.path.join(DATA_DIR, 'bansos')
CONTRIBUTORS_DIR = os.path.join(BANSOS_DIR, 'contributors')
OLD_BANSOS_JSON = os.path.join(DATA_DIR, 'bansos.json')
OLD_COMMIT_CONTRIBUTORS = os.path.join(DATA_DIR, 'commit-contributors.json')
OLD_BANSOS_TS = os.path.join(DATA_DIR, 'bansos.ts')


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.strip().lower()
    # Replace & with 'and'
    text = text.replace('&', ' and ')
    # Remove non-alphanumeric chars
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


def make_contributor_slug(name, url, commit_contributors):
    """Try to find a good slug from commit-contributors, fallback to slugified name."""
    # Check commit-contributors for matching entries
    for item_id, contributors in commit_contributors.items():
        for c in contributors:
            c_name = c.get('name', '').strip().lower()
            c_login = c.get('login', '').strip().lower()
            name_lower = name.strip().lower()
            if c_name == name_lower or c_login == name_lower:
                return c_login

    # Fallback: slugify the name
    slug = slugify(name)
    if not slug:
        hash_id = abs(hash(name + url)) % 10000
        slug = f"contributor-{hash_id}"
    return slug


def format_date(d):
    """Format date for display in Indonesian."""
    if not d:
        return ""
    try:
        d = d.split('T')[0].split(' ')[0]
        return d  # ISO format is fine
    except:
        return str(d)


def generate_readme(item):
    """Generate README.md from bansos index.json data."""
    status_emoji = {
        'active': '✅',
        'expired': '❌',
        'upcoming': '⏳'
    }
    emoji = status_emoji.get(item.get('status', ''), '📦')

    lines = []
    lines.append(f"# {emoji} {item['title']}")
    lines.append("")

    # Provider info
    provider = item.get('provider', '')
    if item.get('providerWebsiteUrl'):
        lines.append(f"**Provider:** [{provider}]({item['providerWebsiteUrl']})")
    else:
        lines.append(f"**Provider:** {provider}")
    lines.append("")

    # Description
    lines.append(item.get('description', ''))
    lines.append("")

    # Status
    status = item.get('status', 'unknown')
    status_text = {'active': 'Aktif', 'expired': 'Kadaluwarsa', 'upcoming': 'Segera Hadir'}
    lines.append(f"> **Status:** {status_text.get(status, status)}")
    lines.append("")

    # Validity
    validity = item.get('validity', {})
    if validity.get('type') == 'fixed' and validity.get('date'):
        lines.append(f"⏰ **Berlaku sampai:** {validity['date']}")
        lines.append("")
    elif validity.get('description'):
        lines.append(f"⏰ **Info Waktu:** {validity['description']}")
        lines.append("")

    # Promo Code
    if item.get('promoCode'):
        lines.append(f"🏷️ **Promo Code:** `{item['promoCode']}`")
        lines.append("")

    # Benefits
    benefits = item.get('benefits', [])
    if benefits:
        lines.append("## Keuntungan")
        lines.append("")
        for b in benefits:
            lines.append(f"- {b}")
        lines.append("")

    # Requirements
    reqs = item.get('requirements', [])
    if reqs:
        lines.append("## Persyaratan")
        lines.append("")
        for r in reqs:
            lines.append(f"- {r}")
        lines.append("")

    # Tips
    if item.get('tips'):
        lines.append("## Tips")
        lines.append("")
        lines.append(item['tips'])
        lines.append("")

    # CTA
    if item.get('ctaLink'):
        lines.append("---")
        lines.append("")
        lines.append(f"[🔗 Klaim Bansos Ini]({item['ctaLink']})")
        lines.append("")

    # Tags
    tags = item.get('tags', [])
    if tags:
        lines.append("")
        lines.append(f"🏷️ Tags: {' · '.join(tags)}")
        lines.append("")

    # Contributor
    if item.get('contributorSlug'):
        lines.append("")
        lines.append(f"✏️ Dikontribusikan oleh `{item['contributorSlug']}`")
        lines.append("")

    # Footer
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*[bansos.dev](https://bansos.dev) — Open Source Catalog*")

    return "\n".join(lines)


def migrate():
    print("🚀 Migrasi bansos.json → folder structure...")
    print(f"  Repo: {REPO}")
    print()

    # Read old data
    with open(OLD_BANSOS_JSON, 'r') as f:
        bansos_list = json.load(f)

    with open(OLD_COMMIT_CONTRIBUTORS, 'r') as f:
        commit_contributors = json.load(f)

    print(f"📦 Total bansos entries: {len(bansos_list)}")
    print(f"👥 Commit contributors mapping entries: {len(commit_contributors)}")
    print()

    # Clean old folder structure
    if os.path.exists(BANSOS_DIR):
        for entry in os.listdir(BANSOS_DIR):
            entry_path = os.path.join(BANSOS_DIR, entry)
            if entry.startswith('__') or entry == 'schema' or entry == 'README.md':
                continue
            if os.path.isdir(entry_path):
                print(f"  🗑️  Clean old: {entry}")
                shutil.rmtree(entry_path)

    # Collect contributor data
    contributor_map = {}  # slug -> { name, url, bansos_slugs }

    os.makedirs(BANSOS_DIR, exist_ok=True)
    os.makedirs(CONTRIBUTORS_DIR, exist_ok=True)

    success_count = 0
    skip_count = 0

    for item in bansos_list:
        slug = item.get('id', '')
        if not slug:
            print(f"  ⚠️  Skipped: no id → {item.get('title', '?')}")
            skip_count += 1
            continue

        # Create folder
        item_dir = os.path.join(BANSOS_DIR, slug)
        os.makedirs(item_dir, exist_ok=True)

        # Convert contributor inline → contributorSlug
        contributor = item.pop('contributor', None)
        contributor_slug = None
        if contributor and contributor.get('name'):
            contributor_slug = make_contributor_slug(
                contributor['name'],
                contributor.get('url', ''),
                commit_contributors
            )
            # Track contributor
            if contributor_slug not in contributor_map:
                contributor_map[contributor_slug] = {
                    'name': contributor['name'],
                    'url': contributor.get('url', ''),
                    'bansos_slugs': []
                }
            contributor_map[contributor_slug]['bansos_slugs'].append(slug)

        # Normalize validity (some old entries have string instead of object)
        raw_validity = item.get('validity', None)
        if isinstance(raw_validity, str):
            validity = {'type': 'uncertain', 'description': raw_validity}
        elif isinstance(raw_validity, dict):
            validity = raw_validity
        else:
            validity = {'type': 'uncertain', 'description': ''}

        # Build new index.json
        index_data = {
            'id': slug,
            'title': item['title'],
            'provider': item['provider'],
            'description': item['description'],
            'benefits': item.get('benefits', []),
            'requirements': item.get('requirements', []),
            'validity': validity,
            'ctaLink': item['ctaLink'],
            'tags': item.get('tags', []),
            'status': item.get('status', 'active'),
            'featured': item.get('featured', False),
        }

        # Optional fields
        for field in ['promoCode', 'tips', 'publishedAt', 'source',
                      'featuredSince', 'featuredUntil', 'providerLogoUrl',
                      'providerWebsiteUrl', 'hidden', 'customUI']:
            if field in item and item[field] not in (None, '', False):
                index_data[field] = item[field]

        # Add contributorSlug (not the old inline object)
        if contributor_slug:
            index_data['contributorSlug'] = contributor_slug

        # Write index.json
        with open(os.path.join(item_dir, 'index.json'), 'w') as f:
            json.dump(index_data, f, indent=4, ensure_ascii=False)
        print(f"  ✅ {slug}/index.json")

        # Generate README.md (skip if customUI)
        if not index_data.get('customUI'):
            readme = generate_readme(index_data)
            with open(os.path.join(item_dir, 'README.md'), 'w', encoding='utf-8') as f:
                f.write(readme)
            print(f"  📝 {slug}/README.md (auto-generated)")
        else:
            # Create empty README if customUI
            readme_path = os.path.join(item_dir, 'README.md')
            if not os.path.exists(readme_path):
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(f"# {item['title']}\n\n<!-- Custom UI enabled - edit freely -->\n")
                print(f"  ✏️  {slug}/README.md (custom UI placeholder)")

        success_count += 1

    print()
    print("👥 Creating contributor manifests...")
    print()

    # Get commit-contributor info for additional details
    for login, info in sorted(contributor_map.items()):
        contrib_dir = os.path.join(CONTRIBUTORS_DIR, login)
        os.makedirs(contrib_dir, exist_ok=True)

        # Check if there's richer data from commit-contributors
        display_name = info['name']
        avatar_path = None
        links = {}

        # Look in commit-contributors for this login
        for item_id, cc_list in commit_contributors.items():
            for cc in cc_list:
                cc_login = cc.get('login', '').strip().lower()
                if cc_login == login:
                    display_name = cc.get('name', display_name)
                    avatar_path = cc.get('avatarUrl')
                    break

        # If contributor has a URL, use it
        if info.get('url'):
            url = info['url'].strip()
            if 'github.com' in url:
                links['github'] = url
            elif url:
                links['website'] = url

        manifest = {
            'login': login,
            'displayName': display_name,
            'bio': '',
            'title': '',
            'skills': [],
            'links': links,
            'contributedBansos': sorted(set(info['bansos_slugs'])),
            'hidden': False,
            'joinedAt': str(date.today())
        }

        if avatar_path:
            manifest['avatar'] = avatar_path

        with open(os.path.join(contrib_dir, 'manifest.json'), 'w') as f:
            json.dump(manifest, f, indent=4, ensure_ascii=False)

        print(f"  👤 {login}/manifest.json ({len(info['bansos_slugs'])} bansos)")

    print()
    print("📊 Generating lightweight index.json...")
    print()

    # Generate index.json (lightweight listing for fast queries)
    index_list = []
    for item in bansos_list:
        slug = item.get('id', '')
        if not slug:
            continue
        # Get status and tags from the already-created index
        index_path = os.path.join(BANSOS_DIR, slug, 'index.json')
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                current = json.load(f)
            index_list.append({
                'id': slug,
                'title': current['title'],
                'provider': current['provider'],
                'status': current['status'],
                'tags': current.get('tags', []),
                'featured': current.get('featured', False),
                'publishedAt': current.get('publishedAt', ''),
                'contributorSlug': current.get('contributorSlug', ''),
            })

    index_path = os.path.join(BANSOS_DIR, 'index.json')
    with open(index_path, 'w') as f:
        json.dump({
            'generatedAt': str(date.today()),
            'total': len(index_list),
            'items': index_list
        }, f, indent=4, ensure_ascii=False)
    print(f"  📋 index.json ({len(index_list)} items)")
    print()
    print(f"✅ Migration complete!")
    print(f"  - {success_count} bansos folders created")
    print(f"  - {len(contributor_map)} contributor manifests created")
    print(f"  - Lightweight index generated")
    print()
    print("📁 Folder structure:")
    print(f"  bansos/            → {success_count} folders")
    print(f"  bansos/contributors/ → {len(contributor_map)} folders")
    print(f"  bansos/schema/     → bansos.schema.json + contributor.schema.json")
    print(f"  bansos/index.json  → lightweight listing")


if __name__ == '__main__':
    migrate()
