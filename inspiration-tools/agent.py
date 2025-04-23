#!/usr/bin/env python3
"""
Simple LangChain agent to orchestrate selected security tools against Azure targets.
"""
import os
import subprocess
from typing import Optional

from langchain import Tool, OpenAI
from langchain.agents import initialize_agent


def run_azurehound(subscription_id: str, output_dir: Optional[str] = None) -> str:
    """
    Runs AzureHound against the given subscription ID.
    Outputs results as JSON to stdout or writes files to output_dir.
    """
    tool_dir = os.path.join(os.path.dirname(__file__), "AzureHound")
    bin_path = os.path.join(tool_dir, "azurehound")
    # Build binary if missing
    if not os.path.exists(bin_path):
        subprocess.run(["go", "build", "-o", bin_path, "."], cwd=tool_dir, check=True)
    cmd = [bin_path, "-subs", subscription_id]
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        cmd.extend(["-out", output_dir])
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout


def run_gatox(kubeconfig: str, output_dir: Optional[str] = None) -> str:
    """
    Runs Gato-X against the Kubernetes cluster defined by kubeconfig.
    """
    # Assume Gato-X installed as Python module
    cmd = ["gatox", "--kubeconfig", kubeconfig]
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        cmd.extend(["--output", output_dir])
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout


def run_fingerprintx(target_ip: str) -> str:
    """
    Runs FingerprintX against a target IP to identify services.
    """
    tool_dir = os.path.join(os.path.dirname(__file__), "fingerprintx")
    bin_path = os.path.join(tool_dir, "fingerprintx")
    if not os.path.exists(bin_path):
        subprocess.run(["go", "build", "-o", bin_path, "."], cwd=tool_dir, check=True)
    result = subprocess.run([bin_path, "-target", target_ip], capture_output=True, text=True)
    return result.stdout


def main():
    # Define tools for LangChain agent
    tools = [
        Tool(
            name="AzureHound",
            func=run_azurehound,
            description="Enumerates Azure resources for a subscription ID."
        ),
        Tool(
            name="Gato-X",
            func=run_gatox,
            description="Audits Kubernetes resources via Gato-X."
        ),
        Tool(
            name="FingerprintX",
            func=run_fingerprintx,
            description="Performs service fingerprinting on a target IP."
        ),
    ]

    # Initialize LLM
    llm = OpenAI(temperature=0)
    # Create a zero-shot React agent
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", verbose=True
    )

    # Example run
    # agent.run("Enumerate subscription 00000000-0000-0000-0000-000000000000 and fingerprint 10.0.0.5")
    print("Agent ready. Use agent.run(...) to execute tasks.")


if __name__ == "__main__":
    main()