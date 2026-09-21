#!/usr/bin/env python3
"""
Dad Joke CLI Helper
Provides curated, offline dad jokes categorized by topic.
"""
import argparse
import random
import sys

JOKES = {
    "general": [
        ("Why don't eggs tell jokes?", "They'd crack each other up."),
        ("I'm afraid for the calendar.", "Its days are numbered."),
        ("What do you call fake spaghetti?", "An impasta.")
    ],
    "tech": [
        ("Why do programmers prefer dark mode?", "Because light attracts bugs."),
        ("How many programmers does it take to change a light bulb?", "None, that's a hardware problem."),
        ("There are 10 types of people in the world:", "Those who understand binary, and those who don't.")
    ],
    "food": [
        ("What do you call a cheese that isn't yours?", "Nacho cheese."),
        ("Why did the tomato blush?", "Because it saw the salad dressing.")
    ],
    "animals": [
        ("What do you call an alligator in a vest?", "An investigator."),
        ("What do you call a sleeping dinosaur?", "A dino-snore.")
    ]
}

def main():
    parser = argparse.ArgumentParser(description="Fetch or print a dad joke by topic.")
    parser.add_argument("--topic", choices=list(JOKES.keys()) + ["all"], default="all",
                        help="Topic category for the dad joke (default: all)")
    args = parser.parse_args()

    if args.topic == "all":
        pool = [joke for sublist in JOKES.values() for joke in sublist]
    else:
        pool = JOKES[args.topic]

    setup, punchline = random.choice(pool)
    print(f"Setup: {setup}")
    print(f"Punchline: {punchline}")

if __name__ == "__main__":
    main()
