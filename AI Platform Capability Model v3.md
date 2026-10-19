# AI Platform Capability Model (v2)

Companion to `AI Platform Landscape v3.html`. Same model, same tiles, laid out as tables so each tier can be read, sorted, and diffed on its own. The HTML is the source of record; this file was generated from its data block on 2026-10-18.

## How the model is built

The model follows the BIAN service-landscape convention in three tiers.

| Tier | Name | What it partitions | Count |
| --- | --- | --- | --- |
| 1 | Business Area | The columns. A broad concern every agent platform has. | 8 |
| 2 | Business Domain | The groups inside a column. A cluster of related services. | 25 |
| 3 | Service Domain | The tiles. One functional pattern acting on one asset. | 127 |

Each service domain is described by a **functional pattern** (what is done) and an **asset** (what it is done to). Two tiles may share an asset only if their patterns differ.

### Prevalence

Prevalence is read from the nine homes on this machine and, from v2, from each runtime's documented protocols and flags. It is not a build status. From v3 the loop itself is on the map: a turn, a tool call, and the prompt assembled for it.

| State | Meaning |
| --- | --- |
| Wide | Most clients store or expose it |
| Mixed | Several clients, in different shapes |
| Rare | One or two clients |
| Host | The model runtime, not an agent client |
| Open | In the product class, but no home or protocol evidences it |

### Evidence codes

| Code | Platform or protocol |
| --- | --- |
| Cx | Codex |
| Cl | Claude Code |
| Cp | GitHub Copilot (CLI and VS Code agent host) |
| Ge | Gemini CLI |
| Ag | Antigravity |
| Gk | Grok |
| He | Hermes |
| Qw | Qwen |
| Ol | Ollama |
| ACP | Agent Client Protocol, the editor-to-agent protocol Copilot and others speak over stdio |
| AHP | Agent Host Protocol, the JSON-RPC protocol of VS Code's agent host process |

## Level 1: Business Areas

| ID | Business Area | Domains | Service Domains | Wide | Mixed | Rare | Host | Open |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| BA1 | Session & Turn | 5 | 20 | 6 | 3 | 9 | 0 | 2 |
| BA2 | Authority & Configuration | 4 | 19 | 2 | 7 | 4 | 0 | 6 |
| BA3 | Extension & Tools | 3 | 20 | 2 | 7 | 8 | 0 | 3 |
| BA4 | Memory | 3 | 14 | 2 | 3 | 8 | 0 | 1 |
| BA5 | Change & Review | 2 | 8 | 0 | 1 | 7 | 0 | 0 |
| BA6 | Orchestration | 4 | 15 | 0 | 4 | 11 | 0 | 0 |
| BA7 | Models | 2 | 11 | 1 | 4 | 4 | 2 | 0 |
| BA8 | Surfaces & Operations | 2 | 20 | 3 | 7 | 8 | 0 | 2 |
| | **Total** | **25** | **127** | **16** | **36** | **59** | **2** | **14** |

## Level 2: Business Domains

| Area | Business Domain | Service Domains | Members |
| --- | --- | ---: | --- |
| BA1 Session & Turn | Session Store | 5 | Session Catalog, Transcript Log, Workspace Binding, Attachment Store, External Reference |
| BA1 Session & Turn | Turn Loop | 2 | Turn Execution, Tool Call Dispatch |
| BA1 Session & Turn | Turn Control | 4 | Turn Interrupt, Message Steering, Human Input Request, Run & Spend Limit |
| BA1 Session & Turn | Continuity | 5 | Resume Set, Session Search, Session Fork, Progress Checkpoint, Session Share Link |
| BA1 Session & Turn | Recovery | 4 | File Rewind, Context Compaction, Archive & Erasure, Transcript Export |
| BA2 Authority & Configuration | Admission | 4 | Workspace Trust, Managed Policy, Content Exclusion, Untrusted Content Guard |
| BA2 Authority & Configuration | Identity | 3 | Account & Credential, Data Use Consent, Agent Credential |
| BA2 Authority & Configuration | Execution Control | 9 | Sandbox Policy, Network Egress, Approval Mode, Remembered Grant, Permission Stream, Secret Redaction, Secret Injection, Content Safety, Audit Export |
| BA2 Authority & Configuration | Configuration | 3 | User Settings, Project Settings, Feature Flag |
| BA3 Extension & Tools | Native Tools | 8 | Shell Execution, File Edit, Code Search, Web Retrieval, Browser & Computer Use, Code Interpreter, Language Service, Codebase Index |
| BA3 Extension & Tools | Packages | 6 | Skill Pack, Plugin Marketplace, MCP Server, Skill Mining, Plugin Verification, MCP Sampling |
| BA3 Extension & Tools | Behavior | 6 | Slash Command, Workflow Script, Persona Definition, Role Assignment, Lifecycle Hook, Output Style |
| BA4 Memory | Briefing | 6 | Prompt Assembly, Instruction File, Instruction Precedence, System Prompt Override, Dynamic Context, Context Budget |
| BA4 Memory | Retention | 5 | Memory Index, Topic Note, Knowledge Base, Team Memory, User Profile |
| BA4 Memory | Pipeline | 3 | Memory Maintenance, Memory Retrieval, Memory Erasure |
| BA5 Change & Review | Change Set | 5 | Change Staging, Edit Attribution, Commit Authoring, Worktree Isolation, Repository State |
| BA5 Change & Review | Review | 3 | Review Annotation, Code Review, Pull Request Flow |
| BA6 Orchestration | Planning | 2 | Execution Plan, Goal & Budget |
| BA6 Orchestration | Delegation | 4 | Subagent Delegation, Foreign Agent Hosting, Competing Runs, Peer Message |
| BA6 Orchestration | Work Queue | 5 | Issue Intake, Follow-up Queue, Scheduled Job, Event Trigger, Work Board |
| BA6 Orchestration | Reach | 4 | Remote Control, Cloud Run, Shared Room, Fleet Console |
| BA7 Models | Model Supply | 7 | Model Catalog, Model Selection, Provider Routing, Local Runtime, Custom Model Build, Bring-your-own Key, Retry & Rate Limit |
| BA7 Models | Cost | 4 | Generation Control, Usage Account, Prompt Cache, Plan & Entitlement |
| BA8 Surfaces & Operations | Surfaces | 14 | Command Line, Headless Run, Agent Protocol Server, Embeddable SDK, IDE Attach, Messaging Channel, Voice, Multimodal Input, Document Authoring, Media Processing, Media Generation, Canvas Document, Desktop & Push Notification, Web & Mobile Surface |
| BA8 Surfaces & Operations | Care | 6 | Runtime Log, Telemetry & Crash, Version & Update, Gateway Liveness, Health Check, Feedback Capture |

## Level 3: Service Domains

One table per business area. Evidence is the file, table, flag, or protocol message that shows the service exists in that home.

### BA1 Session & Turn

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Session Store | Session Catalog | Register | Session | Wide | Cx threads · Cl projects · Cp session-store · Ge history · Ag Gk He Qw |
| Session Store | Transcript Log | Maintain | Transcript | Wide | Cx · Cl jsonl · Cp events.jsonl · Ge Qw chats · Ag steps · He messages |
| Session Store | Workspace Binding | Register | Workspace | Wide | cwd on Cx Cl Cp Ge Ag Gk He Qw |
| Session Store | Attachment Store | Maintain | Attachment | Rare | Cp session files/ · Cp chats scratch dir |
| Session Store | External Reference | Register | Reference | Rare | Cp session_refs: issues, PRs |
| Turn Loop | Turn Execution | Fulfill | Turn | Wide | prompt in, model call, tool calls, response out · Cp turns table · Cx threads · Ag steps · AHP chat channel |
| Turn Loop | Tool Call Dispatch | Process | Tool Call | Wide | Cp tool.execution events, tool-call tracker · Ag steps · ACP tool_call updates · every CLI |
| Turn Control | Turn Interrupt | Operate | Turn | Wide | Cl stream-json interrupt · Cx turn/interrupt · Cp SDK abort() · ACP session/cancel · AHP chat/turnCancelled |
| Turn Control | Message Steering | Process | Inbound Message | Rare | AHP steering pending messages · Cl stream-json input mid-turn · Cl Cp hook additionalContext |
| Turn Control | Human Input Request | Agree | Question | Rare | Cl AskUserQuestion, Elicitation hook · ACP session/request_permission · AHP chat/inputRequested |
| Turn Control | Run & Spend Limit | Allocate | Budget | Mixed | Cl --max-budget-usd · Qw --max-session-turns, --max-wall-time, --max-tool-calls · Ag --print-timeout |
| Continuity | Resume Set | Track | Session | Mixed | Cp open-sessions, sidebar pins · Cx read receipts · Gk active_sessions · Ag presence |
| Continuity | Session Search | Analyze | Transcript | Rare | Cp FTS · Gk session_search |
| Continuity | Session Fork | Provision | Child Session | Rare | Cp fork_count · Cp workspace-fork lock |
| Continuity | Progress Checkpoint | Process | Checkpoint | Rare | Cp checkpoints: overview, work done, next steps |
| Continuity | Session Share Link | Fulfill | Share Link | Open | no home stores a shareable link to a session |
| Recovery | File Rewind | Maintain | File Snapshot | Rare | Cp rewind-file-snapshots · Cl file-history |
| Recovery | Context Compaction | Process | Context | Mixed | He compression · Cp compaction events, usage_checkpoint |
| Recovery | Archive & Erasure | Administer | Session | Rare | Cp archives · Cp cleanup flags |
| Recovery | Transcript Export | Fulfill | Export | Open | no export store in any home |

### BA2 Authority & Configuration

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Admission | Workspace Trust | Agree | Folder | Mixed | Cx trust_level · Cp trustedFolders · Ge · Ag · Gk decided_at |
| Admission | Managed Policy | Administer | Policy | Rare | Cp managed settings: MDM, account policy · Cl dangerous-mode flag |
| Admission | Content Exclusion | Administer | Exclusion Rule | Mixed | Ge .geminiignore · Cp content exclusions · Cl deny-read rules |
| Admission | Untrusted Content Guard | Assess | Content | Open | no home marks pasted or fetched content |
| Identity | Account & Credential | Register | Account | Wide | vendor login on Cx Cl Cp Ge Gk · He Qw endpoint keys |
| Identity | Data Use Consent | Agree | Consent | Rare | Cl Cp telemetry opt-out |
| Identity | Agent Credential | Register | Agent Identity | Open | no home gives the agent its own scoped identity; agents act with the user's login |
| Execution Control | Sandbox Policy | Administer | Sandbox | Mixed | Cx sandbox_policy · He docker limits · Cp sandbox helper |
| Execution Control | Network Egress | Administer | Network Rule | Rare | Cx sandbox network access · Cp proxy resolver |
| Execution Control | Approval Mode | Administer | Approval | Mixed | Cx approval_mode · Gk permission_mode, yolo · Cl autoMode |
| Execution Control | Remembered Grant | Register | Grant | Mixed | Cp permissions-config · Cl allow and deny lists |
| Execution Control | Permission Stream | Track | Permission | Rare | Cp permission.requested events · Ag step permissions |
| Execution Control | Secret Redaction | Process | Secret | Open | no redaction rule or store in any home |
| Execution Control | Secret Injection | Process | Credential | Open | no home injects a credential into one tool call and clears it after |
| Execution Control | Content Safety | Assess | Output | Open | no home stores a safety filter setting or verdict |
| Execution Control | Audit Export | Fulfill | Audit Record | Open | no home exports an audit record; the transcript and permission stream are the nearest thing |
| Configuration | User Settings | Administer | Setting | Wide | Cx config.toml · Cl settings.json · Cp config · Ge Gk He Qw settings |
| Configuration | Project Settings | Administer | Project Setting | Mixed | Cl project dirs · Qw QWEN.local.md · Cp per-directory grants |
| Configuration | Feature Flag | Administer | Flag | Mixed | Ge experimental.autoMemory · Qw enableTeamMemory · Cp agentHost flags |

### BA3 Extension & Tools

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Native Tools | Shell Execution | Operate | Terminal | Wide | He terminal.backend · Cp terminal manager · Cx sandbox · every CLI |
| Native Tools | File Edit | Operate | File | Wide | Cp diff worker, session_files · Cl file-history · Ag steps |
| Native Tools | Code Search | Analyze | Codebase | Rare | Cp tgrep |
| Native Tools | Web Retrieval | Process | Web Page | Mixed | Cl web search and fetch · Ge google_search grounding · Cx browser plugin |
| Native Tools | Browser & Computer Use | Operate | Desktop | Rare | Cx computer-use, browser · He Chromium, cua |
| Native Tools | Code Interpreter | Operate | Interpreter | Rare | Cx node_repl MCP |
| Native Tools | Language Service | Analyze | Symbol | Rare | Cl swift-lsp plugin |
| Native Tools | Codebase Index | Maintain | Index | Open | no home keeps a semantic index of the workspace; search is grep-shaped |
| Packages | Skill Pack | Register | Skill | Mixed | Cl Gk He Cx Ag · Qw slot empty |
| Packages | Plugin Marketplace | Administer | Plugin | Mixed | Cx curated · Cl marketplace · Gk cache · Cp slot |
| Packages | MCP Server | Administer | Server | Mixed | Cx configured · Cl allow rules · Ge empty file · Cp built-in GitHub |
| Packages | Skill Mining | Analyze | Trajectory | Rare | Cp forge proposals · Gk learn-traces |
| Packages | Plugin Verification | Assess | Plugin | Open | no home checks a plugin's signature or hash before install |
| Packages | MCP Sampling | Fulfill | Sampling | Open | no home lets a tool server ask the client to run the model |
| Behavior | Slash Command | Operate | Command | Mixed | Cl commands · Ge commands · Qw /memory |
| Behavior | Workflow Script | Fulfill | Workflow | Rare | Gk .rhai workflows · Ag migrate-workflows |
| Behavior | Persona Definition | Design | Persona | Mixed | He SOUL, agent.personalities · Gk personas |
| Behavior | Role Assignment | Allocate | Role | Mixed | Gk roles · Cl agents |
| Behavior | Lifecycle Hook | Process | Event | Rare | Cp hook events · Qw hook docs |
| Behavior | Output Style | Design | Style | Rare | Qw output-language.md |

### BA4 Memory

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Briefing | Prompt Assembly | Process | Prompt | Wide | instruction files, memory, and dynamic context composed into one request on every client |
| Briefing | Instruction File | Design | Instruction | Wide | CLAUDE.md · GEMINI.md · QWEN.md · AGENTS.md · SOUL.md |
| Briefing | Instruction Precedence | Design | Context Order | Mixed | Ge GEMINI.md walked upward · Qw QWEN.local.md over QWEN.md · Cl CLAUDE.md hierarchy |
| Briefing | System Prompt Override | Administer | System Prompt | Rare | Cl Qw --system-prompt, --append-system-prompt · Cl --bare |
| Briefing | Dynamic Context | Process | Context Item | Rare | Cp dynamic_context_items, workspace context |
| Briefing | Context Budget | Allocate | Context Window | Open | ACP usage_update reports used and size; reporting is not choosing, so no home budgets what enters the window |
| Retention | Memory Index | Maintain | Memory | Mixed | Cl MEMORY.md · Qw and Ge designed paths |
| Retention | Topic Note | Register | Note | Mixed | Cl topic files · Gk memory-v2 observations |
| Retention | Knowledge Base | Maintain | Knowledge | Rare | Ag brain and knowledge |
| Retention | Team Memory | Agree | Memory | Rare | Qw .qwen/team-memory |
| Retention | User Profile | Register | Profile | Rare | He user_profile |
| Pipeline | Memory Maintenance | Process | Memory | Rare | Gk consolidation · Qw dream · Cx memories schema |
| Pipeline | Memory Retrieval | Analyze | Memory | Rare | Gk chunk index FTS |
| Pipeline | Memory Erasure | Administer | Memory | Rare | Gk tombstones and trash |

### BA5 Change & Review

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Change Set | Change Staging | Maintain | Changeset | Rare | Cp agent-host changesets |
| Change Set | Edit Attribution | Track | File Edit | Rare | Cp session_files · Cp edit attribution |
| Change Set | Commit Authoring | Fulfill | Commit | Rare | Cl co-author trailer · Cp commit message generation |
| Change Set | Worktree Isolation | Administer | Worktree | Rare | Gk worktrees.db · Cp worktree isolation, branch names |
| Change Set | Repository State | Monitor | Repository | Rare | Cp sessions.branch, repository · Cp git state |
| Review | Review Annotation | Assess | Annotation | Rare | Cp annotations channel · Ag annotations |
| Review | Code Review | Assess | Change | Mixed | Cx review plugin, codex-auto-review · Gk reviewer persona · Cp review service |
| Review | Pull Request Flow | Fulfill | Pull Request | Rare | Cp pull-request status · Ag permissioned-github |

### BA6 Orchestration

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Planning | Execution Plan | Design | Plan | Mixed | Cl plan mode, task list · Gk execute-plan skill · Ag trajectories |
| Planning | Goal & Budget | Track | Goal | Rare | Cx thread_goals |
| Delegation | Subagent Delegation | Allocate | Agent | Mixed | He async_delegations, max_iterations · Cx spawn edges · Ag nesting · Cp delegation |
| Delegation | Foreign Agent Hosting | Provision | Agent SDK | Rare | Cp agent host: Claude and Codex providers |
| Delegation | Competing Runs | Assess | Trajectory | Rare | Ag battle_mode |
| Delegation | Peer Message | Process | Message | Rare | VS Code inter-session send_message · He peer messages |
| Work Queue | Issue Intake | Register | Issue | Rare | Cp coding-agent assignment · Ag permissioned-github |
| Work Queue | Follow-up Queue | Maintain | Queue | Rare | Cx queue · Cp queue drain |
| Work Queue | Scheduled Job | Operate | Schedule | Rare | He cron · Cp automation schedules |
| Work Queue | Event Trigger | Operate | Trigger | Rare | Cp automation-run on event · Cl FileChanged hook |
| Work Queue | Work Board | Manage | Work Item | Rare | He kanban |
| Reach | Remote Control | Operate | Endpoint | Mixed | Cx enrollments · Ge hostname · Cp socket and WebSocket ingress |
| Reach | Cloud Run | Provision | Cloud Session | Mixed | Cx cloud tasks · Cp coding agent · Cl remote sessions |
| Reach | Shared Room | Operate | Room | Rare | He hosted rooms, peer grants, remote runs |
| Reach | Fleet Console | Monitor | Fleet | Rare | Cp Mission Control |

### BA7 Models

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Model Supply | Model Catalog | Register | Model | Mixed | Cx Gk caches · Cp refresh timer · Ol models |
| Model Supply | Model Selection | Allocate | Model | Wide | Cl setting · Qw model · He default · Cp model_change events · Cx |
| Model Supply | Provider Routing | Allocate | Provider | Mixed | He OpenRouter · Qw local endpoint · Cp BYOK proxy |
| Model Supply | Local Runtime | Operate | Runtime | Host | Ol weights · Qw pointed at 11434 |
| Model Supply | Custom Model Build | Provision | Model | Host | Ol Modelfile, vrai-* models |
| Model Supply | Bring-your-own Key | Administer | Credential | Rare | Cp editor bridge, not ~/.copilot |
| Model Supply | Retry & Rate Limit | Process | Request | Rare | Cl api_retry events · Cp request retry and backoff |
| Cost | Generation Control | Administer | Generation Setting | Mixed | Cx reasoning levels · He reasoning_effort · Cp usage field · Ol sampling params |
| Cost | Usage Account | Analyze | Usage | Mixed | Cp usage events, nano-AIU · He session_model_usage · Qw · Cx tokens · Cl stats-cache |
| Cost | Prompt Cache | Process | Cache | Rare | Cp prompt cache, cached-token counts |
| Cost | Plan & Entitlement | Agree | Subscription | Rare | Cp quotaSnapshots, AI Credit allotment · Cl Max plan |

### BA8 Surfaces & Operations

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Surfaces | Command Line | Operate | CLI | Wide | Cx Cl Cp Ge Ag Gk He Qw |
| Surfaces | Headless Run | Operate | Run | Wide | -p with json and stream-json on Cl Qw Gk Ag Ge Cp · Cx exec |
| Surfaces | Agent Protocol Server | Provision | Protocol Endpoint | Mixed | Cx app-server · Cp --acp · Gk agent stdio · Cp agent host local endpoint (AHP) |
| Surfaces | Embeddable SDK | Provision | SDK | Mixed | Cp copilot-sdk · Cl agent SDK 0.3.281 · Cx SDK 0.157.0, both loaded by Cp agent host |
| Surfaces | IDE Attach | Operate | IDE | Mixed | Cp ide lock · Cl ide · Cx chrome-native-hosts · Ge settings |
| Surfaces | Messaging Channel | Operate | Channel | Rare | He Telegram Discord Slack WhatsApp Signal Teams |
| Surfaces | Voice | Process | Audio | Rare | Cx dictation · He stt |
| Surfaces | Multimodal Input | Process | Image | Mixed | pasted images and screenshots on Cl Ge Cx |
| Surfaces | Document Authoring | Fulfill | Document | Mixed | Cx doc plugins · Gk docx pdf pptx skills |
| Surfaces | Media Processing | Process | Media | Rare | He ffmpeg |
| Surfaces | Media Generation | Fulfill | Media | Open | no home configures an image or video generation model |
| Surfaces | Canvas Document | Design | Canvas | Rare | Cp canvas channel |
| Surfaces | Desktop & Push Notification | Operate | Notification | Rare | Cx notify · Cl push notification tool |
| Surfaces | Web & Mobile Surface | Operate | Web App | Open | no home on this machine is a web or mobile client |
| Care | Runtime Log | Monitor | Log | Wide | Cp process logs · Cl · Ag cli.log · Ol logs |
| Care | Telemetry & Crash | Monitor | Telemetry | Mixed | Cl telemetry · Cp OTLP · Ag crashes |
| Care | Version & Update | Maintain | Install | Mixed | Cx Gk version.json · Ag updater · Cp homebrew · Cl npm |
| Care | Gateway Liveness | Monitor | Gateway | Rare | He gateway_heartbeats · Cp connection tracker |
| Care | Health Check | Assess | Installation | Rare | Cl doctor · Gk inspect |
| Care | Feedback Capture | Register | Feedback | Rare | Cl bug command |

## Functional patterns in use

| Pattern | Service Domains |
| --- | ---: |
| Operate | 17 |
| Process | 17 |
| Administer | 16 |
| Register | 12 |
| Fulfill | 10 |
| Maintain | 9 |
| Assess | 7 |
| Allocate | 6 |
| Analyze | 6 |
| Design | 6 |
| Provision | 6 |
| Agree | 5 |
| Monitor | 5 |
| Track | 4 |
| Manage | 1 |
## Changes from v2 (2026-10-18)

| Change | Detail |
| --- | --- |
| Core loop named | Turn Execution (Fulfill · Turn), Tool Call Dispatch (Process · Tool Call) in a new Turn Loop domain; Prompt Assembly (Process · Prompt) under Briefing |
| Evidenced services added | Execution Plan, Cloud Run, Embeddable SDK, Web Retrieval, Language Service, Code Interpreter, Commit Authoring, Multimodal Input, Content Exclusion, Network Egress, Custom Model Build, Issue Intake, Feedback Capture, Data Use Consent |
| Open services added | Session Share Link, Content Safety, Audit Export, Codebase Index, MCP Sampling, Media Generation, Web & Mobile Surface |
| Folded, not added | Push notification into Desktop & Push Notification; sidebar pins into Resume Set; task list into Execution Plan; sampling parameters into Generation Control (was Reasoning Control); install channel into Version & Update |
| Review fix 1 | Persona and Role renamed Persona Definition and Role Assignment |
| Review fix 2 | Health Check, Retry & Rate Limit, Plan & Entitlement, Message Steering, System Prompt Override, Human Input Request reclassified Rare |
| Review fix 3 | Distinct evidence for Scheduled Job vs Event Trigger, Retry & Rate Limit vs Plan & Entitlement, Agent Protocol Server vs IDE Attach, Peer Message vs Shared Room, Run & Spend Limit vs Subagent Delegation |
| Review fix 4 | Headless Run evidence adds Gemini CLI and Copilot CLI, earning Wide |
| Review fix 5 | ACP and AHP added to the evidence key in the HTML |
| Review fix 6 | New Planning domain holds Execution Plan and Goal & Budget |
| Review fix 7 | Context Budget evidence states that reporting is not choosing |
| Asset collisions | Secret Injection is now Process · Credential and Project Settings is Administer · Project Setting, so no two services share a pattern and asset (found by the data exporter) |
| Area rename | BA1 is Session & Turn |
