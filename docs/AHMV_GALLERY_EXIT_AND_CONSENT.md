# AHMV gallery viewer — escape is mandatory

**Owner-reported regression:** clicking a photo can feel like a trap on mobile; correcting/reporting the photo must never be required to leave image preview.

**Scope of fix:**
- Large, legible **« Retour à l’album » / “Back to album”** action at top of fullscreen viewer (always visible).
- Bigger 48 × 48 close/X button, descriptive accessible label, top safe-area support for phone notches and an explicit Escape handler.
- Existing photo zoom, swiping, thumbs, open/close state and focus restoration remain intact.
- No screenshot, bug-report submission, image upload or device permission is demanded for dismissal.

**Test evidence required:**
- Unit guard `scripts/gallery-viewer-exit.test.ts`.
- Actual AHMV browser route `/galerie/hockey-feminin-2026-2027` in 390 and 1440 viewports: open a real album image, verify the exit button is large/visible, click to close, reopen, press Escape to close.
- Screenshots via `AHMV Gallery Exit QA` workflow. Do not merge until this and normal CI are green.

**Screen capture requests:** A separate feature may offer a clear consent prompt like “Voulez-vous joindre une capture de cet écran?” but must NEVER force it. Browser screen sharing/capture must be initiated by a direct user action, must let the person choose the captured tab/screen, show a preview and request a second explicit approval before sending. No raw screenshot submission should be introduced until an authorized secure attachment API exists. Never claim the application can silently capture the user's device.

**The public site is unchanged until approved merge and production deployment.**
