"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import { Input } from "./ui/input";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type Message = { type: "user" | "ai"; content: string };

type ReferencesContentProps = {
  viewHint: () => void;
  response: string;
  loading: boolean;
  nextThread: (text: string) => void;
};

export function ReferencesContent({
  viewHint,
  response,
  loading,
  nextThread,
}: ReferencesContentProps) {
  const [ask, setAsk] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [showCursor, setShowCursor] = useState(false);
  const typingTargetLenRef = useRef(0);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (response && response.trim()) {
      setConversation((prev: any) => {
        const next = [...prev, { type: "ai", content: response }];
        setTypingIndex(next.length - 1);
        setShowCursor(true);
        typingTargetLenRef.current = response.length;
        return next;
      });
    }
  }, [response]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [conversation, loading, typingIndex]);

  const handleType = useCallback((count: number) => {
    if (count + 1 >= typingTargetLenRef.current) {
      setShowCursor(false);
      setTypingIndex(null);
    }
  }, []);

  const submit = useCallback(() => {
    const val = ask.trim();
    if (!val) return;
    setConversation((prev) => [...prev, { type: "user", content: val }]);
    nextThread(val);
    setAsk("");
  }, [ask, nextThread]);

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 p-4">
      <div
        ref={chatRef}
        className="flex flex-1 min-h-0 flex-col space-y-2 p-2 gap-2 overflow-y-auto custom-scroll"
      >
        {conversation.map((m, i) => {
          const isUser = m.type === "user";
          const activeTyping = m.type === "ai" && i === typingIndex;

          return (
            <div key={i} className="w-full text-[14.4px] leading-relaxed">
              {isUser ? (
                <div className="ml-auto flex max-w-[90%] items-center justify-end gap-2">
                  <div className="rounded-xl bg-[var(--dbl-3)] px-2 py-1 text-[var(--gr-2)] whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/20 text-sm">
                    👤
                  </div>
                </div>
              ) : (
                <div className="flex max-w-[90%] min-w-0 items-center gap-2">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/20">
                    <Image
                      src="/matrix_logo.png"
                      alt="Matrix AI"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="rounded-xl bg-[var(--dbl-2)] px-2 py-1 text-[var(--gr-2)] whitespace-pre-wrap break-words">
                    { (
                      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="w-full">
            <div className="flex max-w-[90%] items-start gap-2">
              <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/20">
                <Image
                  src="/matrix_logo.png"
                  alt="Matrix AI"
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </div>
              <div className="rounded-xl bg-[var(--dbl-2)] px-2 py-1 text-[var(--gr-2)]">
                <span className="inline-block animate-pulse">…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex p-2 justify-center">
        <Input
          type="text"
          value={ask}
          onChange={(e: any) => setAsk(e.target.value)}
          onKeyDown={(e: any) => e.key === "Enter" && submit()}
          placeholder="How can I assist you?"
          className="w-[90%] rounded-lg border border-[var(--gr-2)] bg-[var(--dbl-4)] p-2.5 text-sm text-[var(--gr-2)] outline-none transition
                       focus:scale-[1.02] focus:border-[var(--gr-2)]
                       focus:shadow-[0_0_8px_rgba(125,255,125,0.6),0_0_16px_rgba(125,255,125,0.3)]
                       focus:bg-[var(--dbl-3)]"
        />
      </div>
    </div>
  );
}
