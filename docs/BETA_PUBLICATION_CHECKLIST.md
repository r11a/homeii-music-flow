# Beta 1 publication checklist

Prepared pair: Card `6.0.0-beta.1`, Engine `1.0.0-beta.1`.
Campaign: **HOMEii Flow 6 — Your music. Within reach.**

## Prepared locally

- Gold symbol icon without text; graphite gradient background; full wordmark.
- English Engine onboarding with direct MA URL/token instructions and schema-specific validation error.
- Breaking upgrade warning, installation order, rollback and compatibility guidance.
- Structured bug and feedback forms in both projects.
- Tester checklist and issue/retest process: BETA_TESTING.md.
- HA forum post: HA_FORUM_BETA_POST.md. No Facebook post.
- Approved motion film linked from README; card release workflow attaches it with JS and brand assets.
- Card suite: 481 passed / 34 legacy skipped; Engine: 80 passed. Subsequent search layout tests passed; browser checked phone two-column grid and one-row horizontal recommendations.

## Release actions — not yet performed

1. Owner authorizes making the Engine repository public (currently PRIVATE). Inspect the exact commit and history for private configuration before visibility change.
2. Commit the intended source, docs, tests and dist artifacts to candidate branches. Exclude .release, preview fixtures and superseded films. Include only the approved Film-60s.mp4 and its notes among video assets.
3. Put issue templates on default branches so GitHub displays them.
4. Update preparation-only wording and forum links to final tags once downloads exist.
5. Publish Engine tag v1.0.0-beta.1 first as Pre-release, not Latest, with the clean custom_components archive.
6. Publish card tag v6.0.0-beta.1 as Pre-release, not Latest. Verify install assets and video anonymously.
7. Confirm stable Latest still points to v5.9.3. User-created beta update automations remain outside repository control.
8. Perform a clean install using the published files, then publish the reviewed forum post. Track bugs in GitHub issues.

Local integration branding files are prepared; HA's actual icon display still needs verification. Do not advertise HACS official inclusion. Device-specific grouping, physical touch and background audio require community coverage, as documented.
