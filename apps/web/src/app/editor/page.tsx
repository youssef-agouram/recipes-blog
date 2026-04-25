"use client";

import React, { useState } from "react";
import GoogleDocsEditor from "../../components/editor/GoogleDocsEditor";

export default function EditorPage() {
  const [content, setContent] = useState<any>(null);

  return (
    <div className="min-h-screen bg-muted-50 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Document Editor (Tiptap) — Demo</h1>

        <GoogleDocsEditor initialContent={content} onChange={(json) => setContent(json)} />
      </div>
    </div>
  );
}
