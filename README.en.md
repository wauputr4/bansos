# bansos.dev

[![npm bansosdev](https://img.shields.io/npm/v/bansosdev?label=bansosdev&color=10b981)](https://www.npmjs.com/package/bansosdev)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-ff3e00)](https://kit.svelte.dev/)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://bansos.dev/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/m4WFaQpNGs)
[![Telegram](https://img.shields.io/badge/Telegram-Join%20Channel-0088cc?logo=telegram&logoColor=white)](https://t.me/bansos_dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Follow%20Channel-25D366?logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb8ZXgW1Hsq7j1uhRm0G)

![Bansos Developer Banner](static/og-banner.png)

[**🇮🇩 Indonesia (Default)**](README.md) · [**🌐 English**](README.en.md)

---

# 🌏 English

`Social assistance for broke developers`

**bansos.dev** is an open-source catalog of giveaways, freebies, and the most legit coding tool discounts specifically for Indonesian broke developers. Made so our portfolios stay lit even when our wallets are dying. Looking for free domains, hosting free-tier, cloud credits, API credits, free databases, or startup credits? This is the gathering place! 100% Free, No Clickbait, No Hassle. fr fr 🚀

This site is built as a static SvelteKit site that is super SEO-friendly, data-driven, safe in light/dark mode, and easy to contribute to via email or merge request.

## Quick Keywords

`bansos developer`, `developer promo Indonesia`, `free domains`, `free cloud credits`, `API credits`, `hosting free tier`, `startup credits`, `free developer tools`, `open source Indonesia`, `SvelteKit static site`.

## Key Features

- Crawlable and easy-to-search developer bansos catalog.
- Listings for free domains, free cloud, hosting free-tier, API credits, database credits, and startup benefits.
- Detail pages with provider, benefits, claim requirements, validity period, active/expired status, and official links.
- Tag filters and featured/latest highlights.
- Per-listing data under [`src/lib/data/bansos/`](src/lib/data/bansos/).
- SEO metadata for public pages, including meta description and social card pattern.
- Public contribution workflow via email and Git clone.
- Public contribution page: [bansos.dev/contribute](https://bansos.dev/contribute).
- Terms and conditions: [bansos.dev/terms](https://bansos.dev/terms).

## Deploy and Hosting

This site is deployed and hosted using **Cloudflare Pages** with the `@sveltejs/adapter-cloudflare` adapter. Every time there is a merge request or push to the `main` branch, Cloudflare automatically triggers a build and distributes the super-fast static site along with all pre-rendered dynamic OG images.

## Running the project

```bash
npm install
npm run dev
npm run build
```

Local validation:

```bash
npm run check
npm run lint
```

## Important structure

```text
src/lib/data/bansos/<slug>/    # index.json + README for each listing
src/lib/data/bansos/contributors/ # contributor profiles
src/lib/data/bansos.ts         # loader, selectors, sorting, and stats
src/lib/components/            # reusable UI components
src/routes/list/               # list and bansos detail pages
src/routes/contribute/         # public contribution guide
scripts/add-bansos.mjs         # local script to add data
packages/bansosdev-cli/        # bansosdev CLI (disabled for public submissions)
```

## How to Add Bansos

Currently, active public submissions are via email and Git clone. The form, npx CLI, and bot channels are temporarily disabled due to spam.

> [!TIP]
> **Soon: Submission via Discord & Telegram Bot!**
> We are building bot integrations so you can submit new bansos automatically right from our Discord server or Telegram channel.
> While waiting, join our communities:
>
> - **[Discord Server](https://discord.gg/m4WFaQpNGs)** for chatting, discussions, and chat submissions (coming soon).
> - **[Telegram Channel](https://t.me/bansos_dev)** for instant updates on the latest developer promos directly to your phone.

### 1. Option 1: Via Email

This option is perfect for those who want to share information quickly without touching the terminal.

1. Open the contribution page in your browser: **[bansos.dev/contribute](https://bansos.dev/contribute)**.
2. Select the **Email** tab.
3. Send your proposal to **[submit@bansos.dev](mailto:submit@bansos.dev)** using the provided template.
4. Ensure all important fields are filled: title, provider, benefits, claim requirements, official link, status, source, and contributor.

---

### 2. Option 2: Via Command Line (npx CLI) - Disabled

Public submissions via `npx bansosdev add` are temporarily disabled due to spam. The CLI documentation is kept for maintainers and local testing, but please do not use it for public submissions at this time.

```bash
npx bansosdev add
```

The CLI will guide you field by field to prepare local data.

_You can also send data directly using CLI arguments:_

```bash
npx bansosdev add \
  --id example-bansos \
  --title "Example Developer Bansos" \
  --provider "Example Provider" \
  --description "Short description of the bansos." \
  --benefits "Benefit one|Benefit two" \
  --validity-type fixed \
  --validity-date 2026-06-30 \
  --validity-desc "Valid specifically for students" \
  --published-at 2026-06-13 \
  --requirements "Create an account|Claim the program" \
  --cta-link "https://example.com" \
  --contributor-name "Your Name" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Freebie"
```

### Validity parameters

- `--validity-type` required: choose `fixed`, `uncertain`, or `forever`.
- `--validity-date` required if `--validity-type fixed`, using `YYYY-MM-DD` format (Functions as Expiry Date).
- `--validity-desc` optional for validity notes, quotas, or special conditions.
- `--published-at` optional for the start date in `YYYY-MM-DD` format. Defaults to today.
- `--source` optional for verification source; can be a URL or plain text.

> **Automation Notes:**
>
> - The `provider` parameter will be extracted automatically from the `cta-link` domain.
> - The `status` parameter will be calculated automatically (`active`, `upcoming`, or `expired`) based on the `published-at` and `validity-date`.

### Check JSON payload

```bash
npx bansosdev add ... --mode json
```

---

### 3. Option 3: Via Git Clone (Manual Merge Request)

This option is for those who want to test the code locally or modify files directly.

1. Clone this repository to your computer:

   ```bash
   git clone https://github.com/wauputr4/bansos.git
   cd bansos
   npm install
   ```

2. Add data locally using the helper script:

   ```bash
   npm run add:bansos -- \
     --id example-bansos \
     --title "Example Developer Bansos" \
     --provider "Example Provider" \
     --description "Short description of the bansos." \
     --benefits "Benefit one|Benefit two" \
     --validity-type fixed \
     --validity-date 2026-06-30 \
     --requirements "Create an account|Claim the program" \
     --cta-link "https://example.com" \
     --contributor-name "Your Name" \
     --contributor-url "https://example.com" \
     --tags "Cloud,Freebie"
   ```

   This script validates the data and creates `src/lib/data/bansos/<slug>/index.json` plus its listing README.

   The `--benefits` and `--requirements` arguments are separated by `|`.
   The `--tags` argument is separated by commas.

3. Create a new branch, add commits, push to your fork, and send a merge request to the main repository.

---

### Maintainer mode (Admins / Maintainers Only)

The direct mode for automatic submissions is disabled. For maintainer changes, use Git clone, manual commit, and a merge request to `main`.

```bash
npx bansosdev add ... --mode json
```

The command above is only for checking the JSON payload locally.

For complete CLI details, see [docs/bansosdev-cli.md](docs/bansosdev-cli.md).

## Listing Quality Guidelines

A good listing should include:

- Official link to the provider or program page.
- Specific benefits, such as credit amount, duration, or quota limits.
- Clear claim requirements.
- Status (active, expired, or upcoming).
- Tags that aid searching, e.g., `Cloud`, `Domain`, `AI Credits`, `Startup`, or `No Credit Card`.
- Contributor's name and URL.

## Contribution

- Send data via email to [submit@bansos.dev](mailto:submit@bansos.dev).
- If more comfortable, add via branch and manual merge request.
- Read the full contribution guide in [CONTRIBUTING](https://github.com/wauputr4/bansos/blob/main/.github/CONTRIBUTING.md).

## Community Code of Conduct

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Sponsor & Support

The `bansos.dev` project is built for free by the community. If this project has helped you save your developer budget, feel free to send support via email to [me@wau.my.id](mailto:me@wau.my.id).

> [!NOTE]
> **Soon:** We plan to introduce a feature where donors/visitors can send support (donations) directly to the respective contributors who registered/wrote the bansos listing.

## License

MIT. See [LICENSE](LICENSE).

## Disclaimer

bansos.dev is an **open-source community platform** aimed at helping fellow Indonesian developers find legitimate and legal social assistance programs from official providers. We are not affiliated with any provider.

**We strictly prohibit:**

- Misuse of bansos information for **abuse** or exploiting provider policy/security loopholes.
- Violation of **Terms of Service (ToS)** of any platform or third-party provider.
- Actions that violate **data privacy** of individuals or organizations.
- Any form of **illegal activity** or violation of applicable law.
- Submitting **false, misleading, or unclaimable** bansos information.

All displayed information is for **reference only**. Always verify directly with the official provider site before claiming. We are not responsible for unilateral policy changes by providers, misinterpretation of benefits, or misuse of information by irresponsible parties.

By using bansos.dev, you agree that this platform is merely a **community catalog** and all claims, transactions, or interactions with providers are entirely the personal responsibility of each user.
