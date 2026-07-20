# 📦 Struktur Data Bansos

Setiap bansos punya folder sendiri di `src/lib/data/bansos/<slug>/`.

```
bansos/
├── <slug-bansos>/
│   ├── index.json      # Data bansos item
│   └── README.md       # Landing page (auto-generated atau custom)
├── contributors/
│   └── <login>/
│       ├── manifest.json  # Profil contributor
│       └── avatar.*       # Avatar (opsional)
├── schema/
│   ├── bansos.schema.json
│   └── contributor.schema.json
├── index.json           # Generated index ringan
└── static/images/bansos/
    └── <slug>/          # Gambar entry disimpan di sini
        ├── main.png     # preview image (field `image` di index.json)
        ├── screenshot.png # galeri (field `images` array)
        └── ...
```

## Privacy

Setiap `index.json` bisa punya field `"hidden": true`:
- Otomatis di-skip dari render frontend
- User bisa add ke `.gitignore` kalo mau bener2 hilang dari repo
- Data contributor yang `hidden: true` juga skip dari public page

## Custom UI

Kalo `index.json` punya `"customUI": true`, README.md fully manual — nggak auto digenerate.
