// Platform identity, from COMPARISON-DASHBOARD.md and github-copilot/ARCHITECTURE.md (reviewed 2026-10-18).
// Coverage per service is derived at build time from the evidence strings in the v3 landscape.
module.exports = [
  { code:"Cx", name:"Codex", kind:"client", vendor:"OpenAI", home:"~/.codex", version:"0.162.1 (latest recorded)", auth:"ChatGPT sign-in", model:"gpt-6.1-sol, with eight catalog siblings",
    note:"SQLite state with threads, goals, queue, memories, spawn edges, and remote-control enrollments. Curated plugins for browser, computer use, documents, and review." },
  { code:"Cl", name:"Claude Code", kind:"client", vendor:"Anthropic", home:"~/.claude", version:"not recorded", auth:"Anthropic sign-in", model:"opus",
    note:"Per-project transcripts and auto-memory with a MEMORY.md index. Allow and deny lists for tools, agents, commands, skills, and a plugin marketplace." },
  { code:"Cp", name:"GitHub Copilot", kind:"client", vendor:"GitHub", home:"~/.copilot and VS Code agent-host.db", version:"CLI 1.0.88 · VS Code 1.142.0", auth:"GitHub sign-in", model:"catalog refreshed by the agent host",
    note:"Two stores: the CLI home with sessions, events, and permissions, and the editor's agent host with changesets, review, checkpoints, delegation, and Mission Control." },
  { code:"Ge", name:"Gemini CLI", kind:"client", vendor:"Google", home:"~/.gemini", version:"not recorded", auth:"Google sign-in", model:"not recorded",
    note:"A thin CLI: trust, history, an empty MCP file, GEMINI.md instructions walked upward, and designed but unused memory paths." },
  { code:"Ag", name:"Antigravity", kind:"client", vendor:"Google", home:"~/.gemini/antigravity-cli", version:"not recorded", auth:"Google sign-in", model:"not recorded",
    note:"A trajectory engine: one SQLite file per conversation with steps, nesting, battle mode, annotations, brain, and knowledge. A different product from Gemini CLI." },
  { code:"Gk", name:"Grok", kind:"client", vendor:"xAI", home:"~/.grok", version:"1.0.62", auth:"xAI sign-in", model:"grok-4.7 and three siblings",
    note:"The fullest memory pipeline on the machine: capture, observations, consolidation, tombstones, and a chunk index. Bundled skills, roles, personas, and .rhai workflows." },
  { code:"He", name:"Hermes", kind:"client", vendor:"Nous Research", home:"~/.hermes", version:"not recorded", auth:"OpenRouter key", model:"anthropic/claude-opus-4.6 via OpenRouter",
    note:"Routed and multi-channel: Telegram, Discord, Slack, WhatsApp, Signal, Teams. Cron, kanban, shared rooms, delegation limits, a Docker terminal path, and a user profile." },
  { code:"Qw", name:"Qwen", kind:"client", vendor:"Alibaba", home:"~/.qwen", version:"not recorded", auth:"local endpoint key", model:"deepseek-coder:6.7b through Ollama",
    note:"Points at the local Ollama host. Instruction files at global, team, and local scope, run limits by turns, time, and tool calls, and designed memory paths." },
  { code:"Ol", name:"Ollama", kind:"host", vendor:"Ollama", home:"~/.ollama", version:"not recorded", auth:"none", model:"deepseek-coder, gemma3, llama3.2, mistral, phi4, vrai-*",
    note:"The model host, not an agent client. Weights, a REPL prompt history, and custom models built from Modelfiles. No session, grant, or memory service." }
];
