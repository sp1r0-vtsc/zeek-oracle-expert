#!/usr/bin/env python3
"""
multi_agent_chat_gui.py - A simple GUI to moderate a multi-agent OpenAI discussion.

Usage:
  export OPENAI_API_KEY=your_api_key
  python3 multi_agent_chat_gui.py

Requires:
  pip install openai
"""
import os
import threading
import tkinter as tk
from tkinter import ttk, messagebox
from tkinter.scrolledtext import ScrolledText

import openai
try:
    from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
except ImportError:
    Anthropic = None

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
        return openai.ChatCompletion.create(
            model=model, messages=messages, stream=stream, temperature=temperature
        )


class MultiAgentChatGUI:
    def __init__(self, root):
        self.root = root
        root.title("Multi-Agent Chat Moderator")

        # Top frame: settings
        frm = ttk.Frame(root, padding=10)
        frm.grid(row=0, column=0, sticky="ew")
        ttk.Label(frm, text="Prompt:").grid(row=0, column=0, sticky="w")
        self.prompt_entry = ttk.Entry(frm, width=60)
        self.prompt_entry.grid(row=0, column=1, columnspan=3, sticky="ew")
        ttk.Label(frm, text="Rounds:").grid(row=1, column=0, sticky="w")
        self.rounds_spin = ttk.Spinbox(frm, from_=1, to=10, width=5)
        self.rounds_spin.set(1)
        self.rounds_spin.grid(row=1, column=1, sticky="w")
        ttk.Label(frm, text="Model:").grid(row=1, column=2, sticky="e")
        self.model_entry = ttk.Entry(frm, width=15)
        self.model_entry.insert(0, "gpt-4")
        self.model_entry.grid(row=1, column=3, sticky="w")
        # Workflow selection: basic or extended pipeline
        ttk.Label(frm, text="Workflow:").grid(row=2, column=0, sticky="w")
        self.workflow_box = ttk.Combobox(
            frm, values=["Basic Multi-Agent", "Extended Pipeline"],
            state="readonly", width=20
        )
        self.workflow_box.current(0)
        self.workflow_box.grid(row=2, column=1, columnspan=3, sticky="ew")
        self.start_btn = ttk.Button(frm, text="Start Discussion", command=self.start)
        self.start_btn.grid(row=0, column=4, rowspan=2, padx=5)

        # History frame
        ttk.Label(root, text="Conversation History:").grid(row=1, column=0, sticky="w", padx=10)
        self.history_text = ScrolledText(root, width=80, height=20, state=tk.DISABLED)
        self.history_text.grid(row=2, column=0, padx=10)

        # Moderator frame
        ttk.Label(root, text="Current Agent Response:").grid(row=3, column=0, sticky="w", padx=10)
        self.agent_label = ttk.Label(root, text="(idle)")
        self.agent_label.grid(row=4, column=0, sticky="w", padx=10)
        self.stream_text = ScrolledText(root, width=80, height=10)
        self.stream_text.grid(row=5, column=0, padx=10)
        btn_frm = ttk.Frame(root)
        btn_frm.grid(row=6, column=0, pady=5)
        self.approve_btn = ttk.Button(btn_frm, text="Approve", command=lambda: None, state=tk.DISABLED)
        self.reject_btn = ttk.Button(btn_frm, text="Reject",  command=lambda: None, state=tk.DISABLED)
        self.approve_btn.grid(row=0, column=0, padx=5)
        self.reject_btn.grid(row=0, column=1, padx=5)

        # Prepare agent definitions
        self.agents = [
            {"name": "WAY",   "system": "You are WAY, a senior software architect. Provide high-level design insights."},
            {"name": "CLINE", "system": "You are CLINE, a cybersecurity expert. Focus on security risks and best practices."},
            {"name": "CODEX","system": "You are CODEX, a coding assistant. Give concrete advice on implementation and testing."},
            {"name": "OpenAI","system": "You are an OpenAI assistant. Synthesize the discussion and ensure coherence."},
        ]

    def start(self):
        prompt = self.prompt_entry.get().strip()
        if not prompt:
            messagebox.showerror("Error", "Please enter a prompt.")
            return
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            messagebox.showerror("Error", "Set OPENAI_API_KEY environment variable.")
            return
        openai.api_key = api_key
        workflow = self.workflow_box.get()
        try:
            rounds = int(self.rounds_spin.get())
        except ValueError:
            rounds = 1
        model = self.model_entry.get().strip() or "gpt-4"

        # Disable start button
        self.start_btn.config(state=tk.DISABLED)
        # Clear history
        self.history_text.config(state=tk.NORMAL)
        self.history_text.delete("1.0", tk.END)
        self.history_text.config(state=tk.DISABLED)

    def _run_extended_pipeline(self, prompt, model):
        # Step 1: CODEX summarizes project structure
        self._insert_history("===== Step 1: CODEX Project Summary =====\n")
        # Collect project file list
        file_list = []
        for root_dir, _, files in os.walk(os.getcwd()):
            for f in files:
                rel = os.path.relpath(os.path.join(root_dir, f), os.getcwd())
                file_list.append(rel)
        snapshot = "\n".join(sorted(file_list))
        system1 = ("You are CODEX, a coding assistant. "
                   "Provide a concise summary of the project structure and key files.")
        msgs1 = [
            {"role": "system", "content": system1},
            {"role": "user", "content": f"Project file list:\n{snapshot}"},
        ]
        self.root.after(0, lambda: self.agent_label.config(text="CODEX Summary"))
        self.root.after(0, lambda: self.stream_text.delete("1.0", tk.END))
        content1 = ""
        stream1 = _create_chat_completion(model=model, messages=msgs1, stream=True)
        for chunk in stream1:
            delta = chunk.choices[0].delta.get("content", "")
            if delta:
                content1 += delta
                self.root.after(0, lambda d=delta: self.stream_text.insert(tk.END, d))
        # Moderation for step 1
        event1 = threading.Event()
        self.approval = False
        def ok1():
            self.approval = True
            event1.set()
        def rej1():
            self.approval = False
            event1.set()
        self.root.after(0, lambda: self.approve_btn.config(state=tk.NORMAL, command=ok1))
        self.root.after(0, lambda: self.reject_btn.config(state=tk.NORMAL, command=rej1))
        event1.wait()
        self.root.after(0, lambda: self.approve_btn.config(state=tk.DISABLED))
        self.root.after(0, lambda: self.reject_btn.config(state=tk.DISABLED))
        if not self.approval:
            self._insert_history("CODEX summary rejected.\n\n")
            self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))
            return
        self._insert_history(f"CODEX Summary: {content1}\n\n")

        # Step 2: Claude proposes path forward
        if Anthropic is None:
            self._insert_history("Error: install 'anthropic' package for extended pipeline.\n")
            self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))
            return
        anth_key = os.getenv("ANTHROPIC_API_KEY")
        if not anth_key:
            self.root.after(0, lambda: messagebox.showerror(
                "Error", "Set ANTHROPIC_API_KEY environment variable"))
            self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))
            return
        client = Anthropic(api_key=anth_key)
        prompt2 = (f"{content1}\n\n"
                   "Based on the above summary, propose a path forward "
                   "for building a prototype of the existing functionality.")
        self._insert_history("===== Step 2: Claude Propose Path Forward =====\n")
        self.root.after(0, lambda: self.agent_label.config(text="Claude Proposal"))
        self.root.after(0, lambda: self.stream_text.delete("1.0", tk.END))
        content2 = ""
        stream2 = client.completions.create(
            model="claude-3.5",
            prompt=HUMAN_PROMPT + prompt2 + AI_PROMPT,
            stream=True,
            max_tokens_to_sample=1000,
        )
        for chunk in stream2:
            delta = chunk.get("completion", "")
            content2 += delta
            self.root.after(0, lambda d=delta: self.stream_text.insert(tk.END, d))
        # Moderation for step 2
        event2 = threading.Event()
        self.approval = False
        def ok2():
            self.approval = True
            event2.set()
        def rej2():
            self.approval = False
            event2.set()
        self.root.after(0, lambda: self.approve_btn.config(state=tk.NORMAL, command=ok2))
        self.root.after(0, lambda: self.reject_btn.config(state=tk.NORMAL, command=rej2))
        event2.wait()
        self.root.after(0, lambda: self.approve_btn.config(state=tk.DISABLED))
        self.root.after(0, lambda: self.reject_btn.config(state=tk.DISABLED))
        if not self.approval:
            self._insert_history("Claude proposal rejected.\n\n")
            self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))
            return
        self._insert_history(f"Claude Proposal: {content2}\n\n")

        # Step 3: ChatGPT ensures testability
        system3 = ("You are ChatGPT, a testing expert. "
                   "Evaluate the proposed plan for testability and provide actionable test strategies.")
        msgs3 = [
            {"role": "system", "content": system3},
            {"role": "user", "content": f"Project summary:\n{content1}\n\nPath proposal:\n{content2}"},
        ]
        self._insert_history("===== Step 3: ChatGPT Ensure Testability =====\n")
        self.root.after(0, lambda: self.agent_label.config(text="ChatGPT Evaluation"))
        self.root.after(0, lambda: self.stream_text.delete("1.0", tk.END))
        content3 = ""
        stream3 = _create_chat_completion(model=model, messages=msgs3, stream=True)
        for chunk in stream3:
            delta = chunk.choices[0].delta.get("content", "")
            content3 += delta
            self.root.after(0, lambda d=delta: self.stream_text.insert(tk.END, d))
        # Moderation for step 3
        event3 = threading.Event()
        self.approval = False
        def ok3():
            self.approval = True
            event3.set()
        def rej3():
            self.approval = False
            event3.set()
        self.root.after(0, lambda: self.approve_btn.config(state=tk.NORMAL, command=ok3))
        self.root.after(0, lambda: self.reject_btn.config(state=tk.NORMAL, command=rej3))
        event3.wait()
        self.root.after(0, lambda: self.approve_btn.config(state=tk.DISABLED))
        self.root.after(0, lambda: self.reject_btn.config(state=tk.DISABLED))
        if self.approval:
            self._insert_history(f"ChatGPT Evaluation: {content3}\n\n")
        else:
            self._insert_history("ChatGPT evaluation rejected.\n\n")
        # Re-enable start button
        self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))

        # Launch worker thread
        worker = threading.Thread(
            target=self._chat_worker,
            args=(prompt, rounds, model, workflow),
            daemon=True,
        )
        worker.start()

    def _chat_worker(self, prompt, rounds, model, workflow):
        if workflow == "Extended Pipeline":
            self._run_extended_pipeline(prompt, model)
            return
        # Shared conversation
        conversation = [{"role": "user", "name": None, "content": prompt}]
        # Display user prompt
        self._insert_history(f"User: {prompt}\n\n")
        # Iterate rounds
        for r in range(rounds):
            for agent in self.agents:
                # Precompute label text to capture current round/agent
                label_text = f"{agent['name']} (Round {r+1})"
                # Build messages for API
                msgs = [{"role": "system", "content": agent["system"]}]
                for msg in conversation:
                    if msg["role"] == "user":
                        msgs.append({"role": "user", "content": msg["content"]})
                    else:
                        msgs.append({"role": "assistant", "name": msg["name"], "content": msg["content"]})

                # Update agent label and clear stream
                self.root.after(0, lambda lbl=label_text: self.agent_label.config(text=lbl))
                self.root.after(0, lambda: self.stream_text.delete("1.0", tk.END))

                # Streamed response (new or old API)
                stream = _create_chat_completion(
                    model=model, messages=msgs, stream=True
                )
                content = ""
                for chunk in stream:
                    delta = chunk.choices[0].delta.get("content", "")
                    if delta:
                        content += delta
                        self.root.after(0, lambda d=delta: self.stream_text.insert(tk.END, d))

                # Moderation approval
                approval_event = threading.Event()
                self.approval = False
                def on_approve(ev=approval_event):
                    self.approval = True
                    ev.set()
                def on_reject(ev=approval_event):
                    self.approval = False
                    ev.set()
                # Enable buttons with handlers
                self.root.after(0, lambda: self.approve_btn.config(state=tk.NORMAL, command=on_approve))
                self.root.after(0, lambda: self.reject_btn.config(state=tk.NORMAL,  command=on_reject))
                # Wait for user decision
                approval_event.wait()
                # Disable buttons
                self.root.after(0, lambda: self.approve_btn.config(state=tk.DISABLED))
                self.root.after(0, lambda: self.reject_btn.config(state=tk.DISABLED))

                # Record or discard
                if self.approval:
                    conversation.append({"role": "assistant", "name": agent["name"], "content": content})
                    self._insert_history(f"{agent['name']}: {content}\n\n")
                else:
                    self._insert_history(f"{agent['name']} response rejected.\n\n")

        # Final summary
        self._insert_history("===== Final Summary =====\n")
        summary_sys = (
            "You are an OpenAI assistant. Summarize the above discussion and propose a final course of action."
        )
        msgs = [{"role": "system", "content": summary_sys}]
        for msg in conversation:
            if msg["role"] == "user":
                msgs.append({"role": "user", "content": msg["content"]})
            else:
                msgs.append({"role": "assistant", "name": msg["name"], "content": msg["content"]})
        # Final summary (new or old API)
        summary_resp = _create_chat_completion(model=model, messages=msgs)
        summary = summary_resp.choices[0].message.content if hasattr(summary_resp, 'choices') else summary_resp.choices[0].message.content
        self._insert_history(summary + "\n\n")
        # Re-enable start
        self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))

    def _insert_history(self, text):
        self.history_text.config(state=tk.NORMAL)
        self.history_text.insert(tk.END, text)
        self.history_text.see(tk.END)
        self.history_text.config(state=tk.DISABLED)


if __name__ == "__main__":
    root = tk.Tk()
    app = MultiAgentChatGUI(root)
    root.mainloop()