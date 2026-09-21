# skill-gen

Generate [Agent Skills](https://agentskills.io/home) with Gemini — web UI or CLI.

Describe what you want, get a production-ready `SKILL.md` bundle (scripts, references, resources) that validates against the skill standard.

## Demo

<img src="https://github.com/lifeparticle/skill-wizard/raw/refs/heads/main/brag.gif" />

## Quick start

```bash
pnpm install
cp .env.example .env.local
```

Add your [Gemini API key](https://aistudio.google.com/apikey) to `.env.local`, then:

```bash
pnpm dev
```

Open `http://localhost:5173`. You can also enter the key in the UI (`Cmd/Ctrl+K`) if you skip the env file.

### CLI

```bash
cp .env.example .env.local   # set GEMINI_API_KEY inside
pnpm run generate "E2E Playwright test generator"
```

## What you get

- AI-generated skills from natural language
- Templates (code review, unit tests, deploy, security audit)
- Frontmatter linting & compliance checks
- ZIP download or one-paste terminal install to `.agents/skills/`

## Ready-to-use skills

We've included sample skills in [`skills/`](./skills/) you can use as-is or as starting points:

| Skill | Description |
| --- | --- |
| [`dad-joke-generator`](./skills/dad-joke-generator/) | Wholesome, pun-centric dad jokes by topic or occasion |
| [`child-discipline-routine-builder`](./skills/child-discipline-routine-builder/) | Daily routines and positive reinforcement |

Copy a folder into `.agents/skills/` (or your agent's skills path) to install it.

## Stack

React 19 · TypeScript · Vite · `@google/genai` (`gemini-flash-latest`)

## Contributors

- [Tugcem Yalcin](https://github.com/tugcem) · [LinkedIn](https://www.linkedin.com/in/tugcem-yalcin/)
- [Michael Thompson](https://github.com/MichaelHThompson) · [LinkedIn](https://www.linkedin.com/in/michaelharrythompson/)
- [Mahbub Zaman](https://github.com/lifeparticle) · [LinkedIn](https://www.linkedin.com/in/mahbubzaman/)
