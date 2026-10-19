// Service profiles, BA5 Change & Review.
module.exports = {
"Change Staging": {
  inside: "Collecting an agent's edits into a reviewable change set with a diff, a state, and the files it covers.",
  excludes: "The edits themselves (File Edit), undo (File Rewind), and the commit (Commit Authoring).",
  purpose: "Makes the agent's work reviewable as one change rather than a stream of edits.",
  functions: [["Accumulate","Adds each file change to the session's change set."],["Present","Renders the diff for review on any surface."],["Accept or discard","Applies or reverts the set as a whole."]],
  entities: [["Changeset","One set. Attributes: session id, files, diff, state (open, accepted, discarded), created and updated timestamps."]],
  inbound: [["File Edit","event record","each diff"],["Team Memory","event record","shared note changes"]],
  outbound: [["Review Annotation","in-process call","the diff to annotate"],["Commit Authoring","in-process call","the accepted set"],["IDE Attach","protocol message","the change set for the editor's review view"]],
  security: "Discard restores through File Rewind; nothing is applied outside the workspace.",
  storage: "In the orchestrator database per session.",
  performance: "Diff rendering under 200 ms for typical change sets."
},
"Edit Attribution": {
  inside: "Recording which files a session touched, with which tool, at which turn, so edits can be traced to the conversation that made them.",
  excludes: "Git authorship (Commit Authoring) and the content of changes (Change Staging).",
  purpose: "Answers which conversation changed this file.",
  functions: [["Record touch","Writes path, tool, and turn index for each edit."],["Query by file","Returns the sessions and turns that touched a path."],["Report","Lists a session's touched files."]],
  entities: [["File Touch","One record. Attributes: session id, turn index, path, tool, timestamp."]],
  inbound: [["File Edit","event record","the path touched"],["Shell Execution","event record","files changed by a command, when detectable"]],
  outbound: [["Session Catalog","catalog query","touched files shown with the session"],["Commit Authoring","in-process call","files to attribute"]],
  security: "Paths only.",
  storage: "A table in the session store.",
  performance: "Negligible."
},
"Commit Authoring": {
  inside: "Writing commit messages from the change set and attributing commits to the agent through author or trailer fields.",
  excludes: "Opening a pull request (Pull Request Flow) and the branch the commit lands on (Worktree Isolation).",
  purpose: "Makes agent-made commits readable and identifiable in history.",
  functions: [["Draft message","Writes a message from the diff and the conversation."],["Attribute","Adds the agent as co-author or trailer, and the agent credential as author where configured."],["Commit","Runs the commit through the shell with approval."]],
  entities: [["Commit","One commit. Attributes: hash, message, author, trailers, session id, files."]],
  inbound: [["Change Staging","in-process call","the accepted set"],["Agent Credential","in-process call","the identity to attribute"],["Edit Attribution","in-process call","files to attribute"]],
  outbound: [["Shell Execution","in-process call","the git commit command"],["Repository State","in-process call","the new head"]],
  security: "Commits require approval unless the user has granted it; the agent never signs with the user's key without consent.",
  storage: "The repository.",
  performance: "One model call for the message."
},
"Worktree Isolation": {
  inside: "Giving a session its own git worktree and branch so parallel sessions do not collide, with the branch name generated and recorded.",
  excludes: "The repository's current state (Repository State) and commits (Commit Authoring).",
  purpose: "Lets several agents or sessions work on one repository at once.",
  functions: [["Create worktree","Checks out a new branch into a separate directory."],["Bind session","Records the worktree and branch on the session."],["Clean up","Removes the worktree when the session ends or merges."]],
  entities: [["Worktree","One isolated checkout. Attributes: path, branch, base ref, session id, kind, created timestamp."]],
  inbound: [["Session Catalog","in-process call","the session to isolate"],["Subagent Delegation","in-process call","a child that needs its own tree"]],
  outbound: [["Workspace Binding","in-process call","the worktree as the session's directory"],["Shell Execution","in-process call","git worktree commands"]],
  security: "Worktrees live under a platform-managed directory; removal requires the branch to be merged or the user to confirm.",
  storage: "A table of worktrees and the directories themselves.",
  performance: "Creation is a git checkout."
},
"Repository State": {
  inside: "Tracking the repository, branch, remote, and git status a session works against, refreshed as commands change it.",
  excludes: "Isolating sessions (Worktree Isolation) and making commits (Commit Authoring).",
  purpose: "Keeps the agent and the catalog aware of where the work is landing.",
  functions: [["Detect","Finds the repository root and remote for a workspace."],["Track","Updates branch and status after git commands."],["Expose","Supplies the state to context and the catalog."]],
  entities: [["Repository State","One snapshot. Attributes: root, remote, branch, head, dirty flag, refreshed timestamp."]],
  inbound: [["Workspace Binding","in-process call","the directory"],["Shell Execution","event record","git commands run"],["Commit Authoring","in-process call","the new head"]],
  outbound: [["Session Catalog","in-process call","repository and branch on the entry"],["Dynamic Context","in-process call","branch and status for the prompt"],["Skill Mining","in-process call","repository and branch keys"]],
  security: "Read-only.",
  storage: "On the session record.",
  performance: "Refresh is a git status call."
},
"Review Annotation": {
  inside: "Comments pinned to lines of a change, written by the agent or the user, with a thread and a resolved state.",
  excludes: "The overall review verdict (Code Review) and comments on a pull request at the host (Pull Request Flow).",
  purpose: "Lets review happen in place, before anything leaves the machine.",
  functions: [["Annotate","Creates a comment at a path and range."],["Thread","Replies and resolves."],["Sync","Pushes annotations to the pull request when one exists."]],
  entities: [["Annotation","One comment. Attributes: changeset id, path, range, body, author, resolved, timestamp."]],
  inbound: [["Change Staging","in-process call","the diff"],["Code Review","in-process call","findings to pin"],["IDE Attach","protocol message","user comments from the editor"]],
  outbound: [["Pull Request Flow","HTTP request","comments to publish"],["Turn Execution","in-process call","comments the agent should act on"]],
  security: "Local until synced; sync requires the pull request to exist.",
  storage: "In the orchestrator database.",
  performance: "Immediate."
},
"Code Review": {
  inside: "An agent judging a change for correctness, security, and quality, producing findings with severity and location.",
  excludes: "Pinning findings to lines (Review Annotation) and merging (Pull Request Flow).",
  purpose: "Gives every change a second reader before it ships.",
  functions: [["Review","Reads the diff and the surrounding code and produces findings."],["Verify","Checks each finding against the code before reporting."],["Report","Returns findings ranked by severity, or none."]],
  entities: [["Finding","One issue. Attributes: path, line, category, severity, summary, failure scenario, verdict."]],
  inbound: [["Change Staging","in-process call","the diff"],["Role Assignment","in-process call","the reviewer role"],["Pull Request Flow","HTTP request","a pull request to review"]],
  outbound: [["Review Annotation","in-process call","findings to pin"],["Pull Request Flow","HTTP request","a review posted to the host"]],
  security: "A review is advisory; it does not merge.",
  storage: "Findings with the change set.",
  performance: "Bounded by model calls; large diffs are reviewed in parts."
},
"Pull Request Flow": {
  inside: "Opening a pull request from the change set, tracking its checks and reviews, and reporting its status back to the session.",
  excludes: "The commit (Commit Authoring) and the review itself (Code Review).",
  purpose: "Carries the agent's change through the repository's own merge process.",
  functions: [["Open","Pushes the branch and creates the pull request with a generated description."],["Track","Polls or subscribes to check and review status."],["Report","Surfaces status and links in the session."]],
  entities: [["Pull Request","One request. Attributes: host, number, URL, branch, state, checks, reviews, session id."]],
  inbound: [["Commit Authoring","in-process call","the branch to push"],["Agent Credential","HTTP request","the identity to open under"],["Review Annotation","in-process call","comments to publish"]],
  outbound: [["Git host","HTTP request","the pull request"],["External Reference","in-process call","the reference on the session"],["Desktop & Push Notification","in-process call","status changes"]],
  security: "Push and open require approval; the agent acts under its own credential where one exists.",
  storage: "Status on the session.",
  performance: "Status refresh on a bounded interval."
}
};
