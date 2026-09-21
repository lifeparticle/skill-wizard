#!/usr/bin/env python3
"""
Routine & Chore Chart Generator for Kids.
Generates formatted markdown checklists and token trackers.
"""
import argparse
import sys

PRESETS = {
    "7yo-standard": [
        ("Morning", "Make bed & open curtains", 5),
        ("Morning", "Get dressed & put dirty clothes in hamper", 10),
        ("Morning", "Brush teeth & wash face", 5),
        ("Afternoon", "Empty lunchbox & hang backpack", 5),
        ("Afternoon", "Homework or 20-min reading sprint", 20),
        ("Evening", "Put away toys/games before dinner", 10),
        ("Bedtime", "Pajamas on & teeth brushed", 10),
        ("Bedtime", "Prepare tomorrow's clothes & bedtime story", 15)
    ]
}

def build_chart(preset_name, child_name="Champion"):
    tasks = PRESETS.get(preset_name, PRESETS["7yo-standard"])
    output = []
    output.append(f"# 🌟 {child_name}'s Daily Adventure & Mission Chart 🌟\n")
    output.append("| Time Block | Mission Task | Est. Time | Mon | Tue | Wed | Thu | Fri | Sat | Sun |")
    output.append("|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|")
    for block, task, minutes in tasks:
        output.append(f"| **{block}** | {task} | {minutes}m | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |")
    output.append("\n### ⭐ Weekly Reward Target: 35 stars earned = Special weekend adventure!")
    return "\n".join(output)

def main():
    parser = argparse.ArgumentParser(
        description="Generate a custom daily routine and chore chart for children."
    )
    parser.add_argument(
        "--preset",
        choices=list(PRESETS.keys()),
        default="7yo-standard",
        help="Routine preset configuration to use (default: 7yo-standard)"
    )
    parser.add_argument(
        "--name",
        default="Champion",
        help="Child's name for personalized chart header"
    )
    parser.add_argument(
        "--output",
        help="Optional path to save generated markdown chart"
    )
    args = parser.parse_args()
    
    chart = build_chart(args.preset, args.name)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(chart)
        print(f"[+] Chart successfully written to: {args.output}")
    else:
        print(chart)

if __name__ == "__main__":
    main()
