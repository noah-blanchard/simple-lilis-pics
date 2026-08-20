# Admin guide

The admin CMS is a private, responsive English-only tool under `/admin`. Its hub and navigation expose Projects, Featured, Ratings, and Messages.

It also exposes a Links editor for the public `/links` and `/fr/links` page.

## Sign in

1. Open `/login`.
2. Enter an email/password user created in Supabase Auth.
3. After authentication, the app redirects to `/admin`.

Unauthenticated admin requests redirect to login. An authenticated visit to login redirects back to the dashboard. Use **Sign out** to clear the browser session.

## Dashboard

The hub summarizes projects, the featured count, published ratings, and unread messages. Desktop uses a sidebar/top bar; mobile uses a compact shell and bottom navigation.

Project cards provide:

- Edit.
- Feature/unfeature, up to eight featured projects.
- Delete with confirmation.

Deleting a project removes its database relationships and attempts to remove uploaded Storage objects. This cannot be undone from the UI.

## Create a project

1. Open the new-project form.
2. Add up to four JPEG, PNG, WebP, or AVIF images.
3. Review automatic orientation and change it when needed.
4. Drag images into gallery order and choose the cover.
5. Enter either or both localized titles and descriptions.
6. Optionally use translation assistance, then review the result.
7. Choose a date, featured state, and tags.
8. Save.

Images are compressed in the browser before upload. The server accepts at most 5 MiB per resulting image.

If the hosting platform rejects the batch request as too large, the form offers a sequential retry. It creates project metadata first, uploads each image individually, then saves the cover and photo metadata.

## Edit a project

Editing supports localized text, date, tags, featured state, cover selection, photo order, and orientation. The current implementation does not add or remove photos from an existing project; create a replacement project when the gallery itself must change.

Project text fields are optional. The public resolver uses the other language or a neutral fallback when localized text is missing.

## Manage tags

Open tag management from the project form/dashboard:

- Add both English and French labels.
- Use translation assistance for either direction.
- Edit and save existing labels.
- Delete a tag after confirmation.

English labels generate unique slugs when created. Deleting a tag removes it from every linked project without deleting projects.

## Translation assistance

Translation buttons are available for titles, descriptions, and tag labels when OpenRouter is configured. You can translate a single field or both project title/description fields in one direction.

Existing target text requires overwrite confirmation. Translation is a draft: check names, tone, accents, and photographic terminology before saving.

## Featured bento layout

Open `/admin/featured` to arrange the home-page featured grid.

- Drag tiles into display order.
- Choose tile widths supported by the editor.
- Use automatic/randomized layout helpers when useful.
- Save to persist both order and column span.

Only currently featured projects belong in the submitted layout. The maximum is eight. The tile's vertical footprint is derived from its cover orientation, so verify cover choices before fine-tuning the grid.

## Ratings and testimonials

Open `/admin/ratings` to generate an English or French QR code. Each URL expires after 24 hours and works once. Show it to the person being photographed; their phone opens `/rate/[locale]/[token]`.

Visitors can submit 1–5 stars with an optional name and note. The token is consumed atomically, so refreshes/double taps cannot create two ratings. In the admin:

- Publish or unpublish ratings that include a written note.
- Delete inappropriate or unwanted ratings.
- Track how many qualifying testimonials are approved.

Only approved ratings are public. The home testimonials section remains hidden until three approved ratings with written notes exist. Deleting a rating does not make its token reusable.

## Contact messages

Open `/admin/messages` for the private contact inbox. Messages are newest first and the hub shows unread count.

- Opening an unread message marks it read.
- Mark an opened message unread when it needs follow-up.
- Use Reply to open the configured email client.
- Delete messages permanently after confirmation.

Resend notifications are supplementary; the database inbox remains the durable source of truth.

## Links editor

Open `/admin/links` to edit the public links page in a live mobile preview.

- Use the **Page** tab to upload, replace, or remove the banner, drag its focal
  target, adjust the keyboard-accessible focal sliders, and edit the EN/FR
  welcome phrases. Images are compressed before upload and remain local until
  Save.
- Use **Replay intro** to preview the banner, avatar, identity, and link entrance
  motion. The public animation respects reduced-motion preferences.
- Add a link, then edit its EN/FR name, optional subtitles, destination, icon,
  opening behavior, and publication state in the properties panel.
- Click a preview card to select it. Drag cards to reorder them, or use Move up
  and Move down for keyboard and precise mobile operation.
- Draft links remain visible in the editor with a Draft badge but never reach
  the public page.
- Save commits the complete draft atomically. Discard restores the last server
  snapshot. Closing or reloading a dirty editor triggers a browser warning.
- A conflict means another tab saved first. Reload the server version or keep
  the local draft; the editor never silently overwrites concurrent changes.
- The selected link shows lifetime clicks, the last seven days, their change
  from the preceding week, and the most recent click.

Deleting a link is staged until Save and permanently removes its click history.
Removing a banner is also staged until Save and reveals the built-in warm
gradient fallback. The public page uses only published links in the exact saved
order. Its EN and FR routes do not show a language switcher; the editor retains
its locale preview control.

## Operational checklist

- Confirm the project is visible in both languages.
- Verify gallery order, image orientation, cover, and tags.
- Keep no more than eight featured projects.
- Review the featured home layout after changing covers or featured state.
- Moderate visitor text before publishing it as a testimonial.
- Clear or follow up unread inquiries from the Messages section.
- Treat deletion and destructive seed operations as irreversible.
- Never share the service-role, OpenRouter, or Resend keys with an admin browser user.
