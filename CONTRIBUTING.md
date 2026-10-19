# Contributing

Thank you for helping improve the AI Platform Capability Model. This guide covers three kinds of change: new evidence for a platform, a new service, and a new platform. It ends with the review checklist.

## Where the source of record is

Edit these files. Everything else is generated.

| What | Source of record |
| --- | --- |
| Areas, capabilities, and services: name, pattern, asset, prevalence, evidence | The `var AREAS=[...]` data block in `AI Platform Landscape v3.html`. Each service is a tile: `[name, pattern, asset, prevalence, evidence]`. |
| Ability statements, scope, owner, and the one-line service description | `site/descriptions.js` |
| The five-section service profiles | `site/services/BA1.js` to `site/services/BA8.js`, one file per area, keyed by service name |
| Platform identity: code, name, kind, vendor, home, version, auth, model, note | `site/platforms.js` |

Generated outputs: `site/index.html`, `site/preview.html`, everything in `data/`, and the markdown tables. Do not edit them by hand.

## Adding evidence for a platform

Evidence uses a four-state standard.

| State | Meaning | Counts as presence |
| --- | --- | --- |
| Observed | The home has real sessions, approvals, jobs, or memories | Yes |
| Configured | The setting or plugin is on, even if unused | Yes |
| Shipped | The schema, binary, or bundled skill exists, and this machine has not used it | Yes |
| Not in this home | Nothing in that directory represents the capability | No |

A claim needs proof that someone else can check. One of these counts:

- **A file path** in the platform's home, such as `~/.claude/projects/` or `~/.gemini/trustedFolders.json`.
- **A table** in the platform's database, such as Codex `state_5.sqlite` `threads` or Copilot `session-store.db` `search_index`. A table with zero rows still counts as Shipped.
- **A flag or setting**, such as `-p` with `stream-json`, or `model.baseUrl` in a settings file.
- **A protocol message** from the platform's documented protocol, such as ACP `session/cancel` or AHP `chat/turnCancelled`.

Marketing pages, release notes without a flag or file, and screenshots do not count.

To add evidence, edit the service's evidence string in the v3 data block. Put the platform code next to the proof, separated from other entries by ` · `, for example `Gk session_search.sqlite`. The build derives coverage from the codes in that string. It also reads "every CLI" or "every client" as all clients, and reads `AHP` or `VS Code` as Copilot. A short override list in `site/build.js` covers the few services whose evidence string cannot name every platform. If the new evidence changes how many clients have the service, update its prevalence too: wide, mixed, rare, host, or open.

In the pull request, say which state the evidence is in, and the date and version you read it from.

## Proposing a new service

A new service must meet all of these rules.

1. **One pattern on one asset.** Pick exactly one of the 16 patterns: Direct, Manage, Administer, Design, Provision, Fulfill, Operate, Maintain, Track, Monitor, Analyze, Register, Agree, Assess, Allocate, or Process. Name one asset. The asset must not equal the service name.
2. **No overlap.** It must not do what an existing service already does. Check the excludes line of the neighbors. If a neighbor's bounded context already holds the function, change that profile instead of adding a service.
3. **A full profile.** Add an entry to the right `site/services/BA*.js` file with all five sections: inside, excludes, and purpose; functions; entities; inbound and outbound interfaces; and security, storage, and performance. Every interface source or target must be an existing service name or one of the listed actors in `site/build.js`.
4. **A description.** Add a one-line description to `site/descriptions.js`.
5. **At the end of its capability.** Add the tile as the last entry in its capability. Ids are position-based, so inserting it in the middle would change the ids of the services after it.
6. **Evidence or open.** Give evidence under the four-state standard, or mark it `open` with an empty platform list if the class has it and no home shows it.

Explain in the pull request why the service belongs in the model and which neighbors you checked.

## Proposing a new platform

1. Add an entry to `site/platforms.js` with a new two-letter code (capital then lower case), name, kind (`client` or `host`), vendor, home, version, auth, model, and a short note.
2. Add the new code to the regular expression in `derive()` in `site/build.js` so the build can read it from evidence strings. Because `build.js` is shared, call this out in the pull request.
3. Add the code with its proof to the evidence string of every service the platform exhibits.
4. Revisit prevalence for each service you touched.
5. Record the version and the review date.

## Review checklist

A reviewer checks each item before merging.

- [ ] `cd site && node build.js` passes with no missing descriptions, profiles, or icons.
- [ ] `node site/export.js` passes validation and the printed counts match the change.
- [ ] No service has an asset equal to its name.
- [ ] No two services cite the same evidence. If two tiles of a pair point at the same file or table, the split is wrong or one tile is duplicating the other.
- [ ] Every new or changed interface names a service or a listed actor.
- [ ] New services sit at the end of their capability, so existing ids are unchanged.
- [ ] Evidence names a file path, table, flag, or protocol message.
- [ ] Prose uses plain sentences and no em-dashes.

## License of contributions

By contributing, you agree that your contribution is licensed under CC BY 4.0, the same license as the rest of the model.
