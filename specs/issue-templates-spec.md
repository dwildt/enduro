# Issue Templates Specification

Generated: 2025-12-05T11:35:21.171Z

Purpose
- Provide three ready-to-use GitHub Issue templates to standardize incoming reports: Bug Report, New Feature, and Idea/Discussion.
- Explain file locations and example frontmatter/contents so maintainers can drop these into .github/ISSUE_TEMPLATE/.

Placement
- Add the markdown files under: .github/ISSUE_TEMPLATE/
  - .github/ISSUE_TEMPLATE/bug_report.md
  - .github/ISSUE_TEMPLATE/feature_request.md
  - .github/ISSUE_TEMPLATE/idea.md

Notes
- Each template uses YAML frontmatter to set name, about, title (optional prefix), labels, and assignees.
- Labels referenced in frontmatter should exist in the repository (or the CI/maintainer can create them later).
- Keep templates concise and focused so reporters provide actionable information.

Example templates

1) Bug Report (file: .github/ISSUE_TEMPLATE/bug_report.md)
---
name: "Bug report"
about: "Create a report to help us debug bugs in the game"
title: "[BUG] "
labels: [bug]
assignees: []
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots / Recordings**
If applicable, add screenshots or a short recording to help explain the problem.

**Environment (please complete the following information):**
- OS: (e.g., macOS 14, iOS 17, Android 14)
- Browser: (e.g., Chrome 120, Safari 17)
- Device: (e.g., iPhone 12, Pixel 6)
- Repro rate: (always, sometimes, once)

**Additional context**
Add any other context about the problem here.

2) Feature Request (file: .github/ISSUE_TEMPLATE/feature_request.md)
---
name: "Feature request"
about: "Suggest an enhancement, gameplay feature, or improvement"
title: "[FEATURE] "
labels: [enhancement]
assignees: []
---

**Summary**
A concise summary of the proposed feature.

**Motivation**
Why is this feature useful? Which users or scenarios benefit?

**Detailed design / mockups**
Any sketches, mockups, or step-by-step design notes.

**Alternatives considered**
Outline alternatives and trade-offs.

**Acceptance criteria**
What needs to be true for this feature to be considered done?

3) Idea / Discussion (file: .github/ISSUE_TEMPLATE/idea.md)
---
name: "Idea / Discussion"
about: "Share an idea, open-ended proposal, or start a discussion"
title: "[IDEA] "
labels: [discussion]
assignees: []
---

**Idea**
Describe the idea briefly.

**Context**
Why this idea matters and any background.

**Possible next steps**
Suggested follow-up actions (prototyping, design, feasibility research).

Implementation guidance
- Commit the markdown files into the repository under .github/ISSUE_TEMPLATE/. GitHub will automatically present these templates when a contributor opens a new issue.
- Optionally include a config file `.github/ISSUE_TEMPLATE/config.yml` to set a default template or allow blank issue creation (see GitHub docs).

Example config (optional `.github/ISSUE_TEMPLATE/config.yml`):
```
blank_issues_enabled: false
contact_links: []
```

Maintenance
- Keep templates updated as labels or triage practices change.
- Add or tune fields based on recurring missing information from incoming issues.

End of spec.
