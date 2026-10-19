# AI Platform Capability Model

The AI Platform Capability Model is a product-neutral map of what an AI agent platform does. It covers the class of software that coding agents, chat agents, and local model hosts each implement some part of. It splits that class into 8 capability areas, 25 capabilities, and 127 services. Each service is one functional pattern applied to one asset, and each has a full architectural profile. Alongside the model sits evidence of which of nine platforms exhibit each service. The model is version v3, released 2026-10-18, under CC BY 4.0.

## Three tiers

The model follows the BIAN service-landscape convention. It has three tiers.

| Tier | Name | What it is | Count |
| --- | --- | --- | ---: |
| 1 | Capability Area | A broad concern every agent platform has, such as Session & Turn or Memory. | 8 |
| 2 | Capability | An ability the platform must have inside its area, such as Session Store. | 25 |
| 3 | Service | One functional pattern on one asset, such as Session Catalog (Register · Session). | 127 |

Earlier versions and the landscape HTML use the BIAN names: business area, business domain, and service domain. They mean the same three tiers.

The eight areas are Session & Turn (BA1), Authority & Configuration (BA2), Extension & Tools (BA3), Memory (BA4), Change & Review (BA5), Orchestration (BA6), Models (BA7), and Surfaces & Operations (BA8).

## Pattern and asset

Every service is named by a pair. The **functional pattern** says what is done. The **asset** says what it is done to. There are 16 patterns: Direct, Manage, Administer, Design, Provision, Fulfill, Operate, Maintain, Track, Monitor, Analyze, Register, Agree, Assess, Allocate, and Process.

The rule is one pattern on one asset per service. Two services may share an asset only if their patterns differ. An asset never repeats the service's own name. Two pairs in v3 share both pattern and asset and are told apart by name and profile: Secret Redaction and Secret Injection (BA2.03.06 and BA2.03.07, Process · Secret), and User Settings and Project Settings (BA2.04.01 and BA2.04.02, Administer · Setting). The exporter lists them as notes.

## Ability statements

Each area and each capability is stated as an ability, in the form "Ability to [action] [object] [context]". For example, Session & Turn is the "Ability to hold a conversation with the agent as a durable, resumable record, run each turn inside it under the user's control, and recover it after interruption, across every surface the platform offers." Each statement comes with a scope line that says what is inside and what is left to a neighbor. Each capability also names the role that owns it.

## The service profile

Every service has a profile in five sections.

1. **Domain overview.** What is inside the service, what it excludes and which neighbor owns that, and its purpose.
2. **Functional capabilities.** The functions the service performs, each with a name and a description.
3. **Core domain entities.** The records the service owns, each with a definition and its attributes.
4. **Integration and interfaces.** Inbound interfaces (source, mechanism, purpose) and outbound interfaces (target, mechanism, data or trigger). Every source or target is another service in the model or one of nine external actors: User, Editor, Operating system, Vendor service, Model provider, Git host, Chat platform, Package author, and Organization admin.
5. **Architectural quality constraints.** Security, storage, and performance.

## Prevalence

Each service has a prevalence state. It is read from the evidence. It is not a build status.

| State | Meaning | Services |
| --- | --- | ---: |
| Wide | Most clients store or expose it | 16 |
| Mixed | Several clients, in different shapes | 36 |
| Rare | One or two clients | 59 |
| Host | The model runtime, not an agent client | 2 |
| Open | In the product class, but no home or protocol evidences it | 14 |

The 14 open services show where the class has a gap and not only an inventory.

| Id | Open service |
| --- | --- |
| BA1.04.05 | Session Share Link |
| BA1.05.04 | Transcript Export |
| BA2.01.04 | Untrusted Content Guard |
| BA2.02.03 | Agent Credential |
| BA2.03.06 | Secret Redaction |
| BA2.03.07 | Secret Injection |
| BA2.03.08 | Content Safety |
| BA2.03.09 | Audit Export |
| BA3.01.08 | Codebase Index |
| BA3.02.05 | Plugin Verification |
| BA3.02.06 | MCP Sampling |
| BA4.01.06 | Context Budget |
| BA8.01.11 | Media Generation |
| BA8.01.14 | Web & Mobile Surface |

## Platforms and evidence

Nine platforms were reviewed. Each has a two-letter code used in the evidence strings.

| Code | Platform | Kind | Home reviewed |
| --- | --- | --- | --- |
| Cx | Codex | client | `~/.codex` |
| Cl | Claude Code | client | `~/.claude` |
| Cp | GitHub Copilot | client | `~/.copilot` and the VS Code `agent-host.db` |
| Ge | Gemini CLI | client | `~/.gemini` |
| Ag | Antigravity | client | `~/.gemini/antigravity-cli` |
| Gk | Grok | client | `~/.grok` |
| He | Hermes | client | `~/.hermes` |
| Qw | Qwen | client | `~/.qwen` |
| Ol | Ollama | host | `~/.ollama` |

Evidence was read from these homes on one machine on 2026-10-18. From v2 it also includes each runtime's documented protocols and command-line flags, such as the Agent Client Protocol (ACP) and the Agent Host Protocol (AHP). Each piece of evidence is one of four states.

| State | Meaning |
| --- | --- |
| Observed | The home has real sessions, approvals, jobs, or memories |
| Configured | The setting or plugin is on, even if unused |
| Shipped | The schema, binary, or bundled skill exists, and this machine has not used it |
| Not in this home | Nothing in that directory represents the capability |

The first three count as presence. A shipped but empty table still counts.

The method has limits. Coverage is binary presence, not quality or depth. One machine was reviewed, and some versions were not recorded. A missing mark means no evidence was found, not that the product lacks the service. Copilot's editor process lives outside `~/.copilot`, and Antigravity is a separate product inside `~/.gemini`, so each gets its own column. Ollama is the host row. It gets model services and no session, grant, or memory services.

## Files in this directory

| Path | What it is |
| --- | --- |
| `source/AI Platform Landscape v3.html` | The current landscape: all 127 services on one page, colored by prevalence. Its data block is the source of record for names, patterns, assets, prevalence, and evidence. |
| `source/AI Platform Landscape v2.html` | v2, which added protocol and flag evidence. Kept for history. |
| `source/AI Platform Landscape.html` | v1, read only from what each home stores on disk. Kept for history. |
| `source/Agent Engineering Landscape.html` | The sibling map of a governed multi-agent engineering system. |
| `site/downloads/` | Rendered deliverables: the capability map as PNG and PDF, the one-page v3 poster as PDF and PNG, and a copy of `data/` served by the landscape page. |
| `site/` | The browsable site: explorer, service pages with profiles, compare, dashboard, and data views. |
| `data/` | The open-data release: JSON, YAML, JSON Schema, and CSV. See `data/README.md`. |
| `LICENSE` | The Creative Commons Attribution 4.0 International legal text. |
| `CITATION.cff` | How to cite the model. |
| `CONTRIBUTING.md` | How to add evidence, services, and platforms. |

### Building the site

The site needs only Node. It has no npm dependencies.

```sh
cd site
node build.js
```

This writes `site/index.html`, a publishable fragment, and `site/preview.html`, a full document you can open in a browser. The build reads the v3 landscape data block in `source/`, `site/descriptions.js`, `site/platforms.js`, `site/services/*.js`, `site/views/*`, and `site/template.html`. It fails if a description or profile is missing or if an interface names something that is neither a service nor an actor.

### The landscape page

A second page, the AI Platform Capability Landscape, presents the same model as one map with platform, prevalence, and pattern lenses, a persistent tree, Mermaid service maps on every capability page, and the Graph, Score, and Data views. It is built from `site/lens-template.html` by `site/build-lens.js`, which reads the data block out of `site/index.html`, so run `node build.js` first. `node render-map.js` then renders the map to `site/downloads/capability-map.png` and `.pdf` with headless Chrome, and the build copies `data/` into `site/downloads/data/` so the page can serve the open-data files and zip them in the browser.

```sh
cd site
node build.js && node build-lens.js && node render-map.js
```

### Exporting the data

```sh
node site/export.js
```

This writes everything in `data/` and validates `data/model.json` against `data/model.schema.json`. It exits non-zero on failure.

## Identifiers

Ids are position-based.

| Tier | Example | Form |
| --- | --- | --- |
| Capability Area | `BA1` | `BA` plus the area's position |
| Capability | `BA1.01` | The area id, a dot, and a two-digit position |
| Service | `BA1.01.03` | The capability id, a dot, and a two-digit position |

The stability rule is simple. A renamed item keeps its id. A moved or inserted item changes the ids after it. So a new service goes at the end of its capability, and existing ids stay stable within a version. Each item also has a slug made from its name. Slugs are unique across the model.

## How to cite

See `CITATION.cff` at the root. GitHub and most reference managers read it directly. A plain form:

> Corcoran, P. (2026). *AI Platform Capability Model* (Version v3) [Data set]. Released 2026-10-18. CC BY 4.0.

## License

The model, the data, and the documentation are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). You may share and adapt them for any purpose, including commercially, if you give appropriate credit, link to the license, and indicate changes. The full text is in `LICENSE`.

Product names are trademarks of their owners. The model names them only to report evidence.
