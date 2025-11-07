# Micro Viewer S6.3 — Hover (Engine) + Click action

**Launch**

```powershell
cd D:\work\motor-mv
node packages/micro-viewer/server.mjs
# open http://localhost:4001/public/index.s6.3.html
```

**Behavior**
- Hover на скобке → отправляем в Engine‑Stub `classify` → красим пару:
  - `.mark-ok` — green (действие доступно);
  - `.mark-noop` — purple (действия нет);
  - `.mark-blocked` — red (если появится запрещённый кейс).
- Левый клик по зелёной паре → `click-paren` → Stub OK → снимаем одну внешнюю пару.
- Диапазон по drag — синий `.sel`. Контекстное меню из S6.2 работает.
