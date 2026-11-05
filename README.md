# Methane Target Builder · Ember Labs

Explore what methane target a country could set for 2030, and what it would cost.

**Live:** https://ember-labs-org.github.io/methane-target-builder_labs/ · published on Ember Labs https://ember-labs-org.github.io/methane-target-builder_labs/
**Made by:** Bex Horner, Ember
**Source repo:** [bexhorner/methane-target-builder](https://github.com/bexhorner/methane-target-builder). This repo is the Ember Labs fork of it.

## What it does

- **Choose a country:** 95 countries, the ten biggest emitters first, and see where its methane comes from: coal, oil and gas, agriculture, waste and other sources.
- **Set a reduction target:** the tool finds the cheapest way to reach it. It takes the lowest-cost measures anywhere in the country first and works upwards, so cuts land where they're cheapest rather than being shared out evenly.
- **See the cost:** the net yearly cost of every measure used, the average cost per tonne, and the cost of the last tonne. Measures are grouped as *pays for itself*, *low cost (under $1,000/t)* and *other (above $1,000/t)*.
- **Build your own mix:** drag the handle on any source to change it, and open *Show detail* to see the individual measures.
- **Add thermal coal mine closure** on top of the abatement potential. This isn't costed.
- **Download a chart** of the country, and the full methodology (PDF).
- **Take the tour** for a one-minute walkthrough.

All figures are **annual rates achievable by 2030** once measures are installed, not cumulative totals.

## Data

| Data | Source |
| --- | --- |
| Methane emissions by source; coal, oil and gas abatement measures and costs | IEA [Global Methane Tracker 2026](https://www.iea.org/data-and-statistics/data-tools/methane-tracker) |
| Agriculture and waste abatement | UNEP Global Methane Status Report 2025: global sector ratios applied to each country's emissions, since there are no country-level cost curves |

Costs use the IEA's per-gigajoule figures. The methodology PDF (built into the page) explains the method in full.

**Before wider promotion:** confirm the IEA's terms allow republishing their country-level abatement data in a public tool.

## How it's built

Everything is in one self-contained file, **`index.html`**, around 750 KB (about 170 KB when downloaded, since GitHub Pages compresses it):

- **The data** is embedded in the page as a single object (`D`): for each country, emissions by source, coal and oil and gas abatement curves, and mine-closure figures, plus the UNEP sector ratios.
- **The methodology PDF** is embedded in the page and downloads from it.
- **Outside resources:** Poppins from Google Fonts, and the [iframe-resizer](https://iframe-resizer.com) child script from jsDelivr.

There's no build step and no separate data files. To change the data or the method, edit `index.html` in Bex's repo.

## On the Ember Labs site

- **Hosting:** GitHub Pages, from `main`, root folder.
- **Embedding:** the Labs page shows the tool in a frame. The iframe-resizer script lets the frame grow to fit the whole tool, so nothing is cut off and there's no inner scrollbar.
- **Design:** follows the Ember Labs Design System (Rey Dizon's `ember-labs-branding` skill). The tool doesn't show its own title, logo or footer, because the Labs page provides those.

## Keeping this fork up to date

**Bex's repo is the source of truth.** Changes to the tool, its data or its text are made there first.

- When Bex updates her repo, click **Sync fork** on this repo's GitHub page, then check the live tool.
- **Labs-only additions** live here and don't affect Bex's repo:
  - `README.md`: this file
  - `analytics.js` and two `<script>` lines in the `<head>` of `index.html`: Umami event tracking
- If a sync reports a conflict, it will be in the `<head>`. Keep Bex's version of the page and re-add the two Labs script lines.

## Analytics

Cookieless usage tracking with [Umami](https://umami.is): no cookies, no personal data. It uses the same Umami website as the other Labs tools, and only counts the live site, so local previews aren't recorded. Page loading speed is recorded too. Monthly reports come from the Labs analytics report skill.

`analytics.js` watches the page and sends these events, each labelled `tool: methane-target-builder` with the country selected:

| Event | When | Details |
| --- | --- | --- |
| `country_selected` | a country is chosen | country |
| `slider_set` | the target or a source's handle is released | control (`target` or the source: coal, og, agri, waste, …), value (%) |
| `option_toggled` | thermal coal mine closure on or off | option, on |
| `detail_opened` | "Show detail" on a source | source |
| `breakdown_changed` | a breakdown button inside a source | source, by |
| `download_clicked` | chart download or methodology PDF | what (`chart`, `methodology`) |
| `tour_started` · `tour_skipped` · `tour_finished` · `tour_ended_early` | the tour | step (early exit) |
| `outbound_link_clicked` | a link off the site | domain |

Only real visitor actions count: the tour changes the country and target itself to demonstrate, and those changes are ignored.

**After a Sync fork:** check the two `<script>` lines are still in the `<head>` of `index.html`, and re-add them if needed. The comment above them marks them.
