---
name: child-discipline-routine-builder
description: Guides parents and caregivers in establishing structured daily routines, visual chore frameworks, and positive reinforcement systems tailored for a seven-year-old child. Use when designing morning/bedtime routines, curbing procrastination or screen-time friction, or setting consistent household expectations.
---

# Child Home Discipline & Daily Routine Builder

At age seven, children transition into more concrete logical thinking, desire autonomy, and possess a strong sense of fairness, yet their executive function and impulse control are still maturing. This skill provides an evidence-based, positive-discipline architecture that replaces nagging with predictable visual anchors, co-created boundaries, structured transition warnings, and gamified reinforcement to nurture intrinsic self-discipline at home.

## When to Use

- When establishing or restructuring morning, after-school, or bedtime routines for a 7-year-old
- When a child resists everyday responsibilities like homework, picking up toys, or personal hygiene
- When setting up a transparent reward or token system to encourage self-directed habits
- When screen-time transitions lead to tantrums, negotiation loops, or repeated delays

## Prerequisites & Environment

- Basic knowledge of the child's daily wake-up, school, meal, and bedtime hours
- Identification of top 2-3 behavioral friction points (e.g., shoe-putting, bedtime delay)
- Python 3.8+ (if utilizing the routine chart generator script)

> [!IMPORTANT]
> **Maintain Calm Detachment During Pushback**
> Seven-year-olds are hyper-sensitive to tone and perceived unfairness. Do not respond to defiance with yelling or arbitrary punishments, which stimulate fight-or-flight rather than self-regulation. Hold the boundary quietly and point to the agreed visual schedule.

> [!TIP]
> **Gamify Tedious Chores**
> Turn everyday friction into a mini-game (e.g., 'Beat the 3-minute sand timer to put all Lego bricks in the bin' or 'The floor is lava: save all plushies onto the bed').

## Instructions & Workflow

### Step 1: Define 3-5 Non-Negotiable Core Habits

Focus on high-leverage micro-habits rather than overwhelming the child with long lists. For a 7-year-old, select a maximum of 3-5 core daily habits (e.g., make bed, put backpack in cubby, 20 minutes reading, pajamas and teeth brushed). Frame them in clear, observable language (e.g., 'Shoes on rack' instead of 'Clean room').

```bash
python3 scripts/generate_routine_chart.py --preset 7yo-standard --output routine.md
```

**Verification**: Confirm that habits require no more than 2-3 physical steps and can each be executed within 5-15 minutes.

### Step 2: Co-Create the Visual Schedule with the Child

Sit down with the child to define the order of operations and let them contribute (e.g., choosing whether homework happens before or after afternoon snack). Draw or print visual checklists with checkboxes or velcro tokens so the child owns the verification process.

**Verification**: The child can verbally explain the sequence of events without parental prompting.

### Step 3: Implement the 'When/Then' Boundary Protocol

Eliminate bargaining by framing privileges as natural successors to responsibilities using the 'When/Then' rule: 'When your backpack is emptied and homework folder is signed, then you may have 30 minutes of tablet time.' Maintain calm consistency when boundaries are tested.

**Verification**: Ensure caregivers consistently enforce the order of events without emotional bargaining or premature rewards.

### Step 4: Incorporate Auditory and Visual Transition Cues

A 7-year-old's prefrontal cortex struggles with abrupt task switching, especially from high-dopamine activities (screen time, play). Use dual warnings: a 5-minute visual timer warning followed by a 1-minute countdown cue before a transition begins.

**Verification**: Timers or chimes are visible or audible in the child's play area prior to routine shifts.

### Step 5: Institute Weekly Reflection and Milestone Celebrations

Conduct a 10-minute 'Sunday Family Check-in'. Review completed tasks, celebrate milestones with non-material or experience-based rewards (e.g., choosing Friday movie, park visit), and adjust friction points together.

```bash
python3 scripts/generate_routine_chart.py --summary routine.md
```

**Verification**: Verify that praise focuses on effort ('You stayed focused and put your toys away so fast!') rather than innate traits.

## Review Checklist

1. **Developmental Appropriateness**: Are individual tasks broken down into single, concrete actions rather than vague instructions?
2. **Consistency & Predictability**: Are routine trigger times (wake up, dinner, bedtime) within a consistent 30-minute window daily?
3. **Positive Reinforcement**: Is the praise-to-correction ratio maintained at a minimum of 4:1 to foster intrinsic motivation?
4. **Autonomy & Ownership**: Does the child actively check off their own items rather than the parent monitoring every step?

## Decision Tree & Troubleshooting

1. Is the child refusing to start a task?
   ├── Yes -> Check for hunger/fatigue. If regulated, offer a binary choice: 'Do you want to put your shoes on in your room or at the door?'
   │   ├── Chose an option -> Acknowledge choice and begin.
   │   └── Refused both -> Enforce natural consequence with empathy: 'When shoes are on, then we go to the playground.'
2. Is resistance caused by a screen-time transition?
   ├── Yes -> Validate feelings: 'It is hard to turn off the game.' Use physical timer and provide a tactile bridge (e.g., carrying favorite toy to the table).
   └── No -> Re-verify task clarity: Break the chore into a 2-minute co-operative sprint.

## Scripts & Black-Box Execution

> [!TIP]
> Always run helper scripts with `--help` first to discover valid arguments without loading full source code into context.

- `scripts/generate_routine_chart.py`: CLI tool to generate printable or viewable daily routine and discipline charts tailored for 7-year-olds.

## Detailed References

- [Comprehensive reference document detailing the psychological and emotional capabilities of 7-year-old children.](references/developmental-profile-age-7.md)
