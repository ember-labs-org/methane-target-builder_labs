/* Ember Labs event tracking for the Methane Target Builder.
 *
 * Uses Umami (cookieless, no personal data). The Umami script is loaded in index.html;
 * this file only watches the page for clicks and changes and reports the ones listed
 * below. It doesn't touch the tool's own code. If Umami is blocked or missing, nothing
 * happens and the tool works as normal.
 *
 * Labs-only: this file and the two <script> lines in the <head> exist only in the
 * ember-labs-org fork, not in Bex's repo. After a "Sync fork", check they're still there.
 *
 * Every event carries tool: 'methane-target-builder' and the country currently selected.
 * Event names follow the draft Labs vocabulary (see the standardisation notes).
 *
 * Events
 *   country_selected   {country}
 *   slider_set         {control, value}   control 'target' = overall reduction target (%);
 *                                         otherwise a source (coal, og, agri, waste, …) and
 *                                         its share of potential cut (%). On release, or once
 *                                         when arrow keys stop.
 *   option_toggled     {option, on}       option 'mine_closure'
 *   detail_opened      {source}           "Show detail" on a source
 *   breakdown_changed  {source, by}       the measure breakdown buttons inside a source
 *   download_clicked   {what}             'chart' or 'methodology'
 *   tour_started / tour_skipped / tour_finished / tour_ended_early {step}
 *   outbound_link_clicked {domain}
 */
(function () {
    'use strict';

    var TOOL = 'methane-target-builder';

    function country() {
        var el = document.getElementById('cty');
        if (!el || el.selectedIndex < 0) return undefined;
        var opt = el.options[el.selectedIndex];
        // Option labels read "China — 12,345 kt CH₄/yr"; the value is only an index.
        return opt ? (opt.textContent || '').split(' — ')[0].trim() || undefined : undefined;
    }
    function track(name, data) {
        try {
            if (!window.umami || typeof window.umami.track !== 'function') return;
            var payload = { tool: TOOL, country: country() };
            if (data) Object.keys(data).forEach(function (k) {
                var v = data[k];
                if (v !== undefined && v !== null && v !== '') payload[k] = v;
            });
            window.umami.track(name, payload);
        } catch (e) { /* never let tracking break the tool */ }
    }
    window.labsTrack = track;

    // Only count what a visitor actually did. The tour changes the country, target and
    // detail panels itself with script-generated events, which browsers mark untrusted.
    // (__labsTrackUntrusted exists only so automated tests can simulate clicks.)
    function byVisitor(e) { return e.isTrusted !== false || window.__labsTrackUntrusted === true; }

    function text(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }

    // Report a value once the person has stopped moving it.
    var pending = {};
    function later(key, delay, fn) {
        clearTimeout(pending[key]);
        pending[key] = setTimeout(fn, delay);
    }
    function reportSource(bar, delay) {
        var row = bar.closest('[data-k]');
        var key = row ? row.getAttribute('data-k') : (bar.getAttribute('aria-label') || 'source');
        later('src-' + key, delay, function () {
            var v = Number(bar.getAttribute('aria-valuenow'));
            track('slider_set', { control: key, value: isFinite(v) ? v : undefined });
        });
    }

    document.addEventListener('change', function (e) {
        if (!byVisitor(e)) return;
        var t = e.target;
        if (!t || !t.id) return;
        if (t.id === 'cty') return track('country_selected');
        if (t.id === 'closure') return track('option_toggled', { option: 'mine_closure', on: t.checked });
        if (t.id === 'target') {
            // Range inputs fire 'change' on release, or on every arrow-key step: wait briefly.
            later('target', 600, function () { track('slider_set', { control: 'target', value: Number(t.value) }); });
        }
    }, true);

    document.addEventListener('pointerup', function (e) {
        if (!byVisitor(e)) return;
        var bar = e.target && e.target.closest ? e.target.closest('[role="slider"]') : null;
        if (bar) reportSource(bar, 80);
    }, true);
    document.addEventListener('keyup', function (e) {
        if (!byVisitor(e)) return;
        if (!/^Arrow|^Home$|^End$|^Page/.test(e.key)) return;
        var bar = e.target && e.target.closest ? e.target.closest('[role="slider"]') : null;
        if (bar) reportSource(bar, 800);
    }, true);

    document.addEventListener('click', function (e) {
        if (!byVisitor(e)) return;
        var t = e.target;
        if (!t || !t.closest) return;
        var el;

        if ((el = t.closest('button.exp[data-x]'))) {
            if (el.getAttribute('aria-expanded') !== 'true') track('detail_opened', { source: el.getAttribute('data-x') });
            return;
        }
        if ((el = t.closest('button[data-s][data-d]'))) {
            return track('breakdown_changed', { source: el.getAttribute('data-s'), by: el.getAttribute('data-d') });
        }
        if (t.closest('#dlchart')) return track('download_clicked', { what: 'chart' });
        if (t.closest('#methodology-link')) return track('download_clicked', { what: 'methodology' });

        // Tour: Take a tour → intro card (Start / Skip) → steps (Back / Next / End tour).
        if (t.closest('#tc-start')) return track('tour_started');
        if (t.closest('#tc-skip')) return track('tour_skipped');
        if (t.closest('#tt-end')) {
            var tip = t.closest('.tour-tip');
            return track('tour_ended_early', { step: text(tip && tip.querySelector('.cnt')) || text(tip && tip.querySelector('h4')) });
        }
        if ((el = t.closest('#tt-next')) && /finish|done|close/i.test(text(el))) return track('tour_finished');

        if ((el = t.closest('a[href]'))) {
            var href = el.getAttribute('href') || '';
            if (/^https?:/i.test(href)) {
                var domain;
                try { domain = new URL(href).hostname.replace(/^www\./, ''); } catch (err) { domain = undefined; }
                track('outbound_link_clicked', { domain: domain });
            }
        }
    }, true);
})();
