---
name: dad-joke-generator
description: Generates wholesome, pun-centric, family-friendly dad jokes customized by topic or occasion. Use when asked for dad jokes, lighthearted workplace humor, pun generation, or icebreaker comedy.
---

# Dad Joke Generator

This skill crafts quintessential dad jokes characterized by groan-worthy puns, predictable punchlines, harmless misdirection, and wholesome wordplay. It supports customizable themes (e.g., coding, animals, food, office work), evaluates humor quality according to classic dad joke tropes, and ensures strictly family-safe content.

## When to Use

- When a user asks for a dad joke, pun, or wholesome icebreaker.
- When building team morale or lighthearted chat interactions in development channels.
- When requested to generate comedy or puns around a specific technical or everyday topic.

## Prerequisites & Environment

- No external API keys required; can run locally via standard Python 3.8+ or direct text generation.
- Optional: python3 available in PATH to run the local curated joke selector script.

> [!IMPORTANT]
> **Keep It Wholesome**
> Authentic dad jokes must remain benign and wholesome. Avoid dark humor, sarcastic jabs, or controversial subjects. The goal is mild amusement paired with an involuntary eye-roll.

## Instructions & Workflow

### Step 1: Determine Topic and Delivery Style

Identify if the user specified a domain (e.g., programming, coffee, parenthood, animals) and desired format (e.g., setup/punchline Q&A, one-liner, or dialogue). If none is specified, select a relatable everyday theme.

**Verification**: Confirm the selected topic is universally understood and lends itself naturally to homophones or pun-based misdirection.

### Step 2: Select or Generate Joke

Either invoke the offline script `scripts/dad_joke_cli.py` to retrieve verified classic jokes or construct a novel one adhering to the dad joke formula: high context familiarity, deliberate literalism, and an obvious double meaning.

```bash
python3 scripts/dad_joke_cli.py --topic tech
```

**Verification**: Ensure the punchline induces a classic 'groan and smile' reaction without relying on obscure sarcasm or insider-only jargon.

### Step 3: Validate Quality and Safety

Review the joke against family-friendly safety standards and dad joke archetypes (anti-cynical, wholesome, pun-centric).

**Verification**: Verify that the joke is G-rated, non-offensive, and does not require punchline explanation.

### Step 4: Format and Present Output

Deliver the joke with crisp pacing. Present the setup first, followed by a slight pause/space, and then the punchline.

**Verification**: Inspect that formatting cleanly separates the setup from the punchline.

## Review Checklist

1. **Humor Tone**: Joke relies on puns, literal interpretation, or playful phonetic wordplay rather than sarcasm or disparagement.
2. **Safety & Appropriateness**: Content is strictly G-rated and suitable for all audiences, including professional work environments and family settings.
3. **Delivery**: Setup is concise and punchline lands clearly without needing an accompanying explanation.
4. **Relevance**: Joke matches requested topic or context constraints provided by the user.

## Decision Tree & Troubleshooting

1. User provides a topic? -> Yes: Generate/filter jokes specific to that topic. No: Default to timeless themes (food, tech, animals).
2. Format requested? -> Q&A: 'Why did the...' / 'What do you call...'. One-liner: 'I'm reading a book on anti-gravity...'.
3. Evaluate groans -> If punchline is too clever/abstract, simplify it to make the pun immediate.

## Scripts & Black-Box Execution

> [!TIP]
> Always run helper scripts with `--help` first to discover valid arguments without loading full source code into context.

- `scripts/dad_joke_cli.py`: CLI utility to fetch curated dad jokes offline with topic filtering.

## Detailed References

- [Structural guide and formulas for crafting authentic dad jokes.](references/dad_joke_patterns.md)
