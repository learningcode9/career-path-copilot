import { useState } from "react";

const uuidv4 = () =>
  ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)
  );

type SubmitResponse = { request_id: string; status: "accepted" | "error"; message?: string };

export default function App() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!jd.trim() || (!resumeText.trim() && !resumeFile)) {
      setError("Please provide a JD and either resume text or upload a file.");
      return;
    }

    const rid = uuidv4();
    setRequestId(rid);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("request_id", rid);
      form.append("jd_text", jd);
      if (resumeText.trim()) form.append("resume_text", resumeText);
      if (resumeFile) form.append("resume_file", resumeFile, resumeFile.name);

      const res = await fetch("/api/submit", { method: "POST", body: form });
      const data = (await res.json()) as SubmitResponse;
      if (!res.ok || data.status !== "accepted") {
        throw new Error(data.message || "Submission failed.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Career Path Copilot</h1>
        <p className="text-gray-600 mb-6">Paste a JD and your resume (text or file). We’ll analyze it.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <textarea className="w-full h-40 rounded-xl border px-4 py-3"
              value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the JD here..." />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Resume (paste text)</label>
              <textarea className="w-full h-40 rounded-xl border px-4 py-3"
                value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Optional if uploading a file" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Resume (upload PDF/DOCX/TXT)</label>
              <input type="file" accept=".pdf,.doc,.docx,.txt"
                onChange={e=>setResumeFile(e.target.files?.[0]||null)} />
              <p className="text-xs text-gray-500 mt-2">Use either paste or upload.</p>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl bg-black text-white disabled:opacity-60">
              {loading ? "Submitting..." : "Analyze"}
            </button>
            {requestId && <span className="text-xs text-gray-600">request_id: <code>{requestId}</code></span>}
          </div>
        </form>
      </main>
    </div>
  );
}
