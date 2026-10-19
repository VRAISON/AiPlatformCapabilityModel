# AI Platform Capability Model (v2)

Companion to `AI Platform Landscape v2.html`. Same model, same tiles, laid out as tables so each tier can be read, sorted, and diffed on its own. The HTML is the source of record; this file was generated from its data block on 2026-10-18.

## How the model is built

The model follows the BIAN service-landscape convention in three tiers.

| Tier | Name | What it partitions | Count |
| --- | --- | --- | --- |
| 1 | Business Area | The columns. A broad concern every agent platform has. | 8 |
| 2 | Business Domain | The groups inside a column. A cluster of related services. | 23 |
| 3 | Service Domain | The tiles. One functional pattern acting on one asset. | 103 |

Each service domain is described by a **functional pattern** (what is done) and an **asset** (what it is done to). Two tiles may share an asset only if their patterns differ.

### Prevalence

Prevalence is read from the nine homes on this machine and, from v2, from each runtime's documented protocols and flags. It is not a build status.

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
| BA1 | Session & Continuity | 4 | 17 | 4 | 5 | 7 | 0 | 1 |
| BA2 | Authority & Configuration | 4 | 14 | 2 | 6 | 2 | 0 | 4 |
| BA3 | Extension & Tools | 3 | 15 | 2 | 6 | 6 | 0 | 1 |
| BA4 | Memory | 3 | 13 | 1 | 4 | 7 | 0 | 1 |
| BA5 | Change & Review | 2 | 7 | 0 | 1 | 6 | 0 | 0 |
| BA6 | Orchestration | 3 | 12 | 0 | 2 | 10 | 0 | 0 |
| BA7 | Models | 2 | 10 | 1 | 6 | 2 | 1 | 0 |
| BA8 | Surfaces & Operations | 2 | 15 | 3 | 6 | 6 | 0 | 0 |
| | **Total** | **23** | **103** | **13** | **36** | **46** | **1** | **7** |

## Level 2: Business Domains

| Area | Business Domain | Service Domains | Members |
| --- | --- | ---: | --- |
| BA1 Session & Continuity | Session Store | 5 | Session Catalog, Transcript Log, Workspace Binding, Attachment Store, External Reference |
| BA1 Session & Continuity | Continuity | 4 | Resume Set, Session Search, Session Fork, Progress Checkpoint |
| BA1 Session & Continuity | Turn Control | 4 | Turn Interrupt, Message Steering, Human Input Request, Run & Spend Limit |
| BA1 Session & Continuity | Recovery | 4 | File Rewind, Context Compaction, Archive & Erasure, Transcript Export |
| BA2 Authority & Configuration | Admission | 3 | Workspace Trust, Managed Policy, Untrusted Content Guard |
| BA2 Authority & Configuration | Identity | 2 | Account & Credential, Agent Credential |
| BA2 Authority & Configuration | Execution Control | 6 | Sandbox Policy, Approval Mode, Remembered Grant, Permission Stream, Secret Redaction, Secret Injection |
| BA2 Authority & Configuration | Configuration | 3 | User Settings, Project Settings, Feature Flag |
| BA3 Extension & Tools | Native Tools | 4 | Shell Execution, File Edit, Code Search, Browser & Computer Use |
| BA3 Extension & Tools | Packages | 5 | Skill Pack, Plugin Marketplace, MCP Server, Skill Mining, Plugin Verification |
| BA3 Extension & Tools | Behavior | 6 | Slash Command, Workflow Script, Persona, Role, Lifecycle Hook, Output Style |
| BA4 Memory | Briefing | 5 | Instruction File, Dynamic Context, Instruction Precedence, System Prompt Override, Context Budget |
| BA4 Memory | Retention | 5 | Memory Index, Topic Note, Knowledge Base, Team Memory, User Profile |
| BA4 Memory | Pipeline | 3 | Memory Maintenance, Memory Retrieval, Memory Erasure |
| BA5 Change & Review | Change Set | 4 | Change Staging, Edit Attribution, Worktree Isolation, Repository State |
| BA5 Change & Review | Review | 3 | Review Annotation, Code Review, Pull Request Flow |
| BA6 Orchestration | Delegation | 5 | Subagent Delegation, Foreign Agent Hosting, Competing Runs, Goal & Budget, Peer Message |
| BA6 Orchestration | Work Queue | 4 | Follow-up Queue, Scheduled Job, Event Trigger, Work Board |
| BA6 Orchestration | Reach | 3 | Remote Control, Shared Room, Fleet Console |
| BA7 Models | Model Supply | 6 | Model Catalog, Model Selection, Provider Routing, Local Runtime, Bring-your-own Key, Retry & Rate Limit |
| BA7 Models | Cost | 4 | Reasoning Control, Usage Account, Prompt Cache, Plan & Entitlement |
| BA8 Surfaces & Operations | Surfaces | 10 | Command Line, Headless Run, Agent Protocol Server, IDE Attach, Messaging Channel, Voice, Document Authoring, Media Processing, Canvas Document, Desktop Notification |
| BA8 Surfaces & Operations | Care | 5 | Runtime Log, Telemetry & Crash, Version & Update, Gateway Liveness, Health Check |

## Level 3: Service Domains

One table per business area. Evidence is the file, table, flag, or protocol message that shows the service exists in that home.

### BA1 Session & Continuity

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Session Store | Session Catalog | Register | Session | Wide | Cx threads · Cl projects · Cp session-store · Ge history · Ag Gk He Qw |
| Session Store | Transcript Log | Maintain | Transcript | Wide | Cx · Cl jsonl · Cp events.jsonl · Ge Qw chats · Ag steps · He messages |
| Session Store | Workspace Binding | Register | Workspace | Wide | cwd on Cx Cl Cp Ge Ag Gk He Qw |
| Session Store | Attachment Store | Maintain | Attachment | Rare | Cp session files/ · Cp chats scratch dir |
| Session Store | External Reference | Register | Reference | Rare | Cp session_refs: issues, PRs |
| Continuity | Resume Set | Track | Session | Mixed | Cp open-sessions · Cx read receipts · Gk active_sessions · Ag presence |
| Continuity | Session Search | Analyze | Transcript | Rare | Cp FTS · Gk session_search |
| Continuity | Session Fork | Provision | Child Session | Rare | Cp fork_count · Cp workspace-fork lock |
| Continuity | Progress Checkpoint | Process | Checkpoint | Rare | Cp checkpoints: overview, work done, next steps |
| Turn Control | Turn Interrupt | Operate | Turn | Wide | Cl stream-json interrupt · Cx turn/interrupt · Cp SDK abort() · ACP session/cancel · AHP chat/turnCancelled |
| Turn Control | Message Steering | Process | Inbound Message | Mixed | AHP steering pending messages · Cl stream-json input mid-turn · Cl Cp hook additionalContext |
| Turn Control | Human Input Request | Agree | Question | Mixed | Cl AskUserQuestion, Elicitation hook · ACP session/request_permission · AHP chat/inputRequested |
| Turn Control | Run & Spend Limit | Allocate | Budget | Mixed | Cl --max-budget-usd · Qw --max-session-turns, --max-wall-time, --max-tool-calls · Ag --print-timeout · He max_iterations |
| Recovery | File Rewind | Maintain | File Snapshot | Rare | Cp rewind-file-snapshots · Cl file-history |
| Recovery | Context Compaction | Process | Context | Mixed | He compression · Cp compaction events, usage_checkpoint |
| Recovery | Archive & Erasure | Administer | Session | Rare | Cp archives · Cp cleanup flags |
| Recovery | Transcript Export | Fulfill | Export | Open | no export store in any home |

### BA2 Authority & Configuration

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Admission | Workspace Trust | Agree | Folder | Mixed | Cx trust_level · Cp trustedFolders · Ge · Ag · Gk decided_at |
| Admission | Managed Policy | Administer | Policy | Rare | Cp managed settings: MDM, account policy · Cl dangerous-mode flag |
| Admission | Untrusted Content Guard | Assess | Content | Open | no home marks pasted or fetched content |
| Identity | Account & Credential | Register | Account | Wide | vendor login on Cx Cl Cp Ge Gk · He Qw endpoint keys |
| Identity | Agent Credential | Register | Agent Identity | Open | no home gives the agent its own scoped identity; agents act with the user's login |
| Execution Control | Sandbox Policy | Administer | Sandbox | Mixed | Cx sandbox_policy · He docker limits · Cp sandbox helper |
| Execution Control | Approval Mode | Administer | Approval | Mixed | Cx approval_mode · Gk permission_mode, yolo · Cl autoMode |
| Execution Control | Remembered Grant | Register | Grant | Mixed | Cp permissions-config · Cl allow and deny lists |
| Execution Control | Permission Stream | Track | Permission | Rare | Cp permission.requested events · Ag step permissions |
| Execution Control | Secret Redaction | Process | Secret | Open | no redaction rule or store in any home |
| Execution Control | Secret Injection | Process | Secret | Open | no home injects a credential into one tool call and clears it after |
| Configuration | User Settings | Administer | Setting | Wide | Cx config.toml · Cl settings.json · Cp config · Ge Gk He Qw settings |
| Configuration | Project Settings | Administer | Setting | Mixed | Cl project dirs · Qw QWEN.local.md · Cp per-directory grants |
| Configuration | Feature Flag | Administer | Flag | Mixed | Ge experimental.autoMemory · Qw enableTeamMemory · Cp agentHost flags |

### BA3 Extension & Tools

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Native Tools | Shell Execution | Operate | Terminal | Wide | He terminal.backend · Cp terminal manager · Cx sandbox · every CLI |
| Native Tools | File Edit | Operate | File | Wide | Cp diff worker, session_files · Cl file-history · Ag steps |
| Native Tools | Code Search | Analyze | Codebase | Rare | Cp tgrep |
| Native Tools | Browser & Computer Use | Operate | Desktop | Rare | Cx computer-use, browser · He Chromium, cua |
| Packages | Skill Pack | Register | Skill | Mixed | Cl Gk He Cx Ag · Qw slot empty |
| Packages | Plugin Marketplace | Administer | Plugin | Mixed | Cx curated · Cl marketplace · Gk cache · Cp slot |
| Packages | MCP Server | Administer | Server | Mixed | Cx configured · Cl allow rules · Ge empty file · Cp built-in GitHub |
| Packages | Skill Mining | Analyze | Trajectory | Rare | Cp forge proposals · Gk learn-traces |
| Packages | Plugin Verification | Assess | Plugin | Open | no home checks a plugin's signature or hash before install |
| Behavior | Slash Command | Operate | Command | Mixed | Cl commands · Ge commands · Qw /memory |
| Behavior | Workflow Script | Fulfill | Workflow | Rare | Gk .rhai workflows · Ag migrate-workflows |
| Behavior | Persona | Design | Persona | Mixed | He SOUL, agent.personalities · Gk personas |
| Behavior | Role | Allocate | Role | Mixed | Gk roles · Cl agents |
| Behavior | Lifecycle Hook | Process | Event | Rare | Cp hook events · Qw hook docs |
| Behavior | Output Style | Design | Style | Rare | Qw output-language.md |

### BA4 Memory

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Briefing | Instruction File | Design | Instruction | Wide | CLAUDE.md · GEMINI.md · QWEN.md · AGENTS.md · SOUL.md |
| Briefing | Dynamic Context | Process | Context Item | Rare | Cp dynamic_context_items, workspace context |
| Briefing | Instruction Precedence | Design | Context Order | Mixed | Ge GEMINI.md walked upward · Qw QWEN.local.md over QWEN.md · Cl CLAUDE.md hierarchy |
| Briefing | System Prompt Override | Administer | System Prompt | Mixed | Cl Qw --system-prompt, --append-system-prompt · Cl --bare |
| Briefing | Context Budget | Allocate | Context Window | Open | ACP usage_update reports used and size; no home chooses what enters the window against a budget |
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
| Change Set | Worktree Isolation | Administer | Worktree | Rare | Gk worktrees.db · Cp worktree isolation, branch names |
| Change Set | Repository State | Monitor | Repository | Rare | Cp sessions.branch, repository · Cp git state |
| Review | Review Annotation | Assess | Annotation | Rare | Cp annotations channel · Ag annotations |
| Review | Code Review | Assess | Change | Mixed | Cx review plugin, codex-auto-review · Gk reviewer persona · Cp review service |
| Review | Pull Request Flow | Fulfill | Pull Request | Rare | Cp pull-request status · Ag permissioned-github |

### BA6 Orchestration

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Delegation | Subagent Delegation | Allocate | Agent | Mixed | He async_delegations, max_iterations · Cx spawn edges · Ag nesting · Cp delegation |
| Delegation | Foreign Agent Hosting | Provision | Agent SDK | Rare | Cp agent host: Claude and Codex providers |
| Delegation | Competing Runs | Assess | Trajectory | Rare | Ag battle_mode |
| Delegation | Goal & Budget | Track | Goal | Rare | Cx thread_goals |
| Delegation | Peer Message | Process | Message | Rare | VS Code inter-session send_message · He rooms |
| Work Queue | Follow-up Queue | Maintain | Queue | Rare | Cx queue · Cp queue drain |
| Work Queue | Scheduled Job | Operate | Schedule | Rare | He cron · Cp automation runs |
| Work Queue | Event Trigger | Operate | Trigger | Rare | Cp automation runs · Cl FileChanged hook |
| Work Queue | Work Board | Manage | Work Item | Rare | He kanban |
| Reach | Remote Control | Operate | Endpoint | Mixed | Cx enrollments · Ge hostname · Cp socket and WebSocket ingress |
| Reach | Shared Room | Operate | Room | Rare | He hosted rooms, peer grants, remote runs |
| Reach | Fleet Console | Monitor | Fleet | Rare | Cp Mission Control |

### BA7 Models

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Model Supply | Model Catalog | Register | Model | Mixed | Cx Gk caches · Cp refresh timer · Ol models |
| Model Supply | Model Selection | Allocate | Model | Wide | Cl setting · Qw model · He default · Cp model_change events · Cx |
| Model Supply | Provider Routing | Allocate | Provider | Mixed | He OpenRouter · Qw local endpoint · Cp BYOK proxy |
| Model Supply | Local Runtime | Operate | Runtime | Host | Ol weights · Qw pointed at 11434 |
| Model Supply | Bring-your-own Key | Administer | Credential | Rare | Cp editor bridge, not ~/.copilot |
| Model Supply | Retry & Rate Limit | Process | Request | Mixed | Cl system/api_retry events · Cp quotaSnapshots |
| Cost | Reasoning Control | Administer | Effort | Mixed | Cx reasoning levels · He reasoning_effort · Cp usage field |
| Cost | Usage Account | Analyze | Usage | Mixed | Cp usage events, nano-AIU · He session_model_usage · Qw · Cx tokens · Cl stats-cache |
| Cost | Prompt Cache | Process | Cache | Rare | Cp prompt cache, cached-token counts |
| Cost | Plan & Entitlement | Agree | Subscription | Mixed | Cp quotaSnapshots, AI Credit allotment · Cl Max plan |

### BA8 Surfaces & Operations

| Domain | Service Domain | Pattern | Asset | Prevalence | Evidence |
| --- | --- | --- | --- | --- | --- |
| Surfaces | Command Line | Operate | CLI | Wide | Cx Cl Cp Ge Ag Gk He Qw |
| Surfaces | Headless Run | Operate | Run | Wide | -p with json and stream-json on Cl Qw Gk Ag · Cx exec |
| Surfaces | Agent Protocol Server | Provision | Protocol Endpoint | Mixed | Cx app-server · Cp --acp · Gk agent stdio · Cp agent host local endpoint (AHP) |
| Surfaces | IDE Attach | Operate | IDE | Mixed | Cp ide lock · Cl ide · Cx app-server · Ge settings |
| Surfaces | Messaging Channel | Operate | Channel | Rare | He Telegram Discord Slack WhatsApp Signal Teams |
| Surfaces | Voice | Process | Audio | Rare | Cx dictation · He stt |
| Surfaces | Document Authoring | Fulfill | Document | Mixed | Cx doc plugins · Gk docx pdf pptx skills |
| Surfaces | Media Processing | Process | Media | Rare | He ffmpeg |
| Surfaces | Canvas Document | Design | Canvas | Rare | Cp canvas channel |
| Surfaces | Desktop Notification | Operate | Notification | Rare | Cx notify |
| Care | Runtime Log | Monitor | Log | Wide | Cp process logs · Cl · Ag cli.log · Ol logs |
| Care | Telemetry & Crash | Monitor | Telemetry | Mixed | Cl telemetry · Cp OTLP · Ag crashes |
| Care | Version & Update | Maintain | Install | Mixed | Cx Gk version.json · Ag updater |
| Care | Gateway Liveness | Monitor | Gateway | Rare | He gateway_heartbeats · Cp connection tracker |
| Care | Health Check | Assess | Installation | Mixed | Cl doctor · Gk inspect |

## Functional patterns in use

| Pattern | Service Domains |
| --- | ---: |
| Operate | 15 |
| Administer | 14 |
| Process | 13 |
| Register | 10 |
| Maintain | 8 |
| Allocate | 6 |
| Assess | 6 |
| Analyze | 5 |
| Design | 5 |
| Monitor | 5 |
| Agree | 4 |
| Fulfill | 4 |
| Track | 4 |
| Provision | 3 |
| Manage | 1 |

## Review notes on v2 (2026-10-18)

Findings from reviewing the v2 additions against the model's own rules. None are blocking; each is a one-line change in the HTML data block.

| # | Finding | Tiles | Suggested fix |
| --- | --- | --- | --- |
| 1 | Asset equals name, the flaw v1 called out and removed | Persona (Design · Persona), Role (Allocate · Role) | Rename to Persona Definition and Role Assignment |
| 2 | Mixed with only two clients, which the legend defines as Rare | Health Check (Cl, Gk), Retry & Rate Limit (Cl, Cp), Plan & Entitlement (Cp, Cl), Message Steering (Cl, Cp via AHP), System Prompt Override (Cl, Qw), Human Input Request (Cl, Cp via AHP) | Reclassify as Rare, or add the missing clients to the evidence |
| 3 | Same evidence cited by two tiles | Scheduled Job and Event Trigger both cite Cp automation runs; Retry & Rate Limit and Plan & Entitlement both cite Cp quotaSnapshots; Agent Protocol Server and IDE Attach both cite Cx app-server; Peer Message and Shared Room both cite He rooms; Run & Spend Limit and Subagent Delegation both cite He max_iterations | Give each tile the evidence that distinguishes it, or merge |
| 4 | Headless Run is Wide on five clients while Workspace Trust is Mixed on five | Headless Run | Gemini CLI and Copilot CLI also take `-p`; add them so Wide is earned, or drop to Mixed |
| 5 | Protocol codes ACP and AHP appear in evidence but not in the HTML legend | Turn Interrupt, Message Steering, Human Input Request, Context Budget, Agent Protocol Server | Add ACP and AHP to the platform-codes key |
| 6 | Run & Spend Limit (Allocate · Budget) sits in Session & Continuity while Goal & Budget (Track · Goal) sits in Orchestration | Run & Spend Limit, Goal & Budget | Acceptable as different patterns; consider moving both under one domain so budget reads as one story |
| 7 | Context Budget is Open but its evidence cites ACP usage_update | Context Budget | Consistent with the Open definition (reporting is not choosing); keep, and say so in the evidence |
