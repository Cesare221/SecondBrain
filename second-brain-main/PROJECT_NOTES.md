# Day 28 — Second Brain

30 günde 30 proje serisinin 28. günü. Notları, fikirleri, linkleri ve snippet'ları kaybetmeden hızla yakalamak için minimal bir "second brain" uygulaması.

---

## Konsept

Slide mesajı: "Stop losing notes, links, and random thoughts." Çözüm: hızlı capture + tip bazlı renk kodlama + gerçek zamanlı arama = her şey tek sayfada, anında bulunabilir.

---

## Tasarım Dili

`timestamp-converter` baz alındı. Ek olarak:
- **4 type rengi**: indigo (note) · amber (idea) · sky blue (link) · green (snippet)
- **Sticky header** — sticky top + backdrop-blur glassmorphism efekti
- **Kart accent bar**: her kartın üstünde 3px renkli çizgi
- **Masonry layout**: CSS columns ile 2 kolonlu Pinterest görünümü
- **Snippet mode**: monospace + yeşil renk + kod benzeri arka plan

---

## Stack

| Katman | Seçim |
|---|---|
| Framework | React 19 + Vite 5 |
| Styling | Pure CSS + design tokens |
| State | `useState` + `useMemo` + `useCallback` |
| Persistence | `localStorage` |
| Font | Inter + system mono |

---

## Özellikler

1. **Tip seçici** — Note / Idea / Link / Snippet (pill toggle, aktif renk ile)
2. **Textarea** — çok satırlı, tip placeholder'ı değişir, ⌘↵ ile kaydet
3. **URL alanı** — sadece Link tipinde gösterir
4. **Tag alanı** — virgülle ayrılmış; karta pill olarak işlenir
5. **Arama** — header'da pill input, ⌘K shortcut, content + tag + URL'de arar
6. **Tip filtreleri** — All / Notes / Ideas / Links / Snippets (sayaçlı)
7. **Pin** — pinned items her zaman üstte; amber rengi ikon
8. **Copy** — 1 tıkla clipboard; feedback (yeşil ✓)
9. **Delete** — kırmızı hover
10. **Pinned / Recent** ayrımı (başlık row'u ile)

---

## Mimari Notlar

### State şeması
```js
items: [{
  id: number,
  type: 'note' | 'idea' | 'link' | 'snippet',
  content: string,
  url: string,        // sadece link tipinde dolu
  tags: string[],
  pinned: boolean,
  createdAt: timestamp,
}]
```

### Layout
- Header: sticky, `backdrop-filter: blur(16px)`, search sağda
- Main: `max-width: 960px`
- Quick add card → Filter pills → Cards masonry grid
- `.cards-grid`: `columns: 2 300px; column-gap: 12px` — responsive masonry
- 720px altında 1 kolon, 600px'de header sub gizlenir

### TYPE_META objesi
Tip bazlı renk, dim (arka plan), border ve placeholder tek yerde yönetiliyor:
```js
const TYPE_META = {
  note:    { label, color, dim, border, placeholder },
  idea:    { ... },
  link:    { ... },
  snippet: { ... },
}
```

CSS custom property (`--card-color`, `--card-dim`, `--card-border`) ile kartlara aktarılıyor — hiç `if/switch` yok.

### Arama mantığı
`useMemo` ile: `content.toLowerCase().includes(q)` || `url.includes(q)` || `tags.some(t => t.includes(q))`

### Sıralama
Pinned önce, sonra `createdAt` desc.

---

## Tamamlandı / Test

- `npm install` — 61 paket, temiz
- `npm run build` — 338ms, 9.86kB CSS / 204.77kB JS, hata yok
- `npm run dev` — `localhost:5175` 200 OK
- Klavye: ⌘K search focus, ⌘↵ save

---

## Sonraki Adımlar (opsiyonel)

- Inline edit — karta çift tıklayınca düzenleme modu
- Tag filtresi — tag pill'e tıklayınca o tag'e filtrele
- Export — tüm notları Markdown olarak indir
- Renk temaları — kullanıcı custom aksan rengi seçsin
- Karakter limiti / kelime sayacı
