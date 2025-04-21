#!/usr/bin/env python3
"""
multi_agent_chat.py - Orchestrate a discussion among multiple OpenAI-based agents

Usage:
  export OPENAI_API_KEY=your_api_key
  python3 multi_agent_chat.py --prompt "Discuss architecture for ..." --rounds 2

Requires:
  pip install openai
"""
import os
import time
import argparse
import openai

# Support both OpenAI Python v1 (client.chat.completions) and older API
try:
    from openai import OpenAI
    _openai_client = OpenAI()
    def _create_chat_completion(model, messages, stream=False, temperature=None):
        params = {"model": model, "messages": messages}
        if temperature is not None:
            params["temperature"] = temperature
        if stream:
            params["stream"] = True
        return _openai_client.chat.completions.create(**params)
except ImportError:
    def _create_chat_completion(model, messages, stream=False, temperature=None):
        # Older openai-python (<1.0.0)
        return openai.ChatCompletion.create(
            model=model,
            messages=messages,
            stream=stream,
            temperature=temperature,
        )

def main():
    parser = argparse.ArgumentParser(
        description="Multi-agent chat: WAY, CLINE, CODEX, and OpenAI Assistant"
    )
    parser.add_argument(
        "--prompt", "-p", required=True,
        help="Initial user prompt (topic or architecture to discuss)"
    )
    parser.add_argument(
        "--rounds", "-n", type=int, default=1,
        help="Number of discussion rounds per agent"
    )
    parser.add_argument(
        "--model", "-m", default="gpt-4",
        help="OpenAI model to use for chat completions"
    )
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: set OPENAI_API_KEY environment variable")
        return
    openai.api_key = api_key

    # Define each agent with a distinct system role
    agents = [
        {
            "name": "WAY",
            "system": (
                "You are WAY, a senior software architect. "
                "Provide high-level design insights and considerations."
            ),
        },
        {
            "name": "CLINE",
            "system": (
                "You are CLINE, a cybersecurity expert. "
                "Focus on security risks, threat models, and best practices."
            ),
        },
        {
            "name": "CODEX",
            "system": (
                "You are CODEX, a coding assistant familiar with implementation details. "
                "Give concrete advice on how to build and test components."
            ),
        },
        {
            "name": "OpenAI",
            "system": (
                "You are an OpenAI assistant. "
                "Synthesize the discussion and ensure coherence."
            ),
        },
    ]

    # Shared conversation history (sequence of messages)
    conversation = []
    # Add the initial user message
    conversation.append({"role": "user", "name": None, "content": args.prompt})

    # Run discussion rounds
    for round_idx in range(args.rounds):
        for agent in agents:
            # Build messages for this agent: include its system prompt then the conversation
            messages = [{"role": "system", "content": agent["system"]}]
            for msg in conversation:
                if msg["role"] == "user":
                    messages.append({"role": "user", "content": msg["content"]})
                else:
                    # assistant message with a name field
                    messages.append({
                        "role": "assistant",
                        "name": msg["name"],
                        "content": msg["content"],
                    })
            # Call the OpenAI ChatCompletion API (new or old)
            response = _create_chat_completion(
                model=args.model,
                messages=messages,
                temperature=0.7,
            )
            reply = response.choices[0].message.content.strip()
            # Display the agent's response
            print(f"\n----- {agent['name']} (Round {round_idx+1}) -----\n{reply}\n")
            # Append to the shared conversation
            conversation.append({"role": "assistant", "name": agent["name"], "content": reply})
            # be polite to the API
            time.sleep(0.5)

    # Final synthesis: ask OpenAI assistant to summarize and propose action
    print("\n===== Final Summary and Proposed Action =====\n")
    summary_system = (
        "You are an OpenAI assistant. "
        "Summarize the above multi-agent discussion and propose a final course of action."
    )
    messages = [{"role": "system", "content": summary_system}]
    for msg in conversation:
        if msg["role"] == "user":
            messages.append({"role": "user", "content": msg["content"]})
        else:
            messages.append({
                "role": "assistant",
                "name": msg["name"],
                "content": msg["content"],
            })
    summary_resp = _create_chat_completion(
        model=args.model,
        messages=messages,
        temperature=0.7,
    )
    print(summary_resp.choices[0].message.content.strip())

if __name__ == "__main__":
    main()