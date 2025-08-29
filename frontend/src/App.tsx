import React, { useState } from "react";

function App() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const jdOk = jd.trim().length > 0;
    const hasResume = resumeText.trim().length > 0 || !!resumeFile;
    if (!jdOk || !hasResume) {
      setError(
        "Please provide a Job Description and either paste resume text or upload a file."
      );
      return;
    }
    setError("");
    setSubmitting(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append("jd", jd.trim());
      if (resumeText.trim()) form.append("resumeText", resumeText.trim());
      if (resumeFile) form.append("resumeFile", resumeFile, resumeFile.name);

      const resp = await fetch("/api/submit", { method: "POST", body: form });
      if (!resp.ok) throw new Error(await resp.text());
      const json = await resp.json().catch(() => ({}));
      setResult(json);
    } catch (err: any) {
      setError(err?.message || "Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
            CP
          </div>
          <span className="text-xl font-semibold">
            Career Path <span className="text-blue-400">Copilot</span>
          </span>
        </div>
        <div className="flex gap-4">
          <a href="#about" className="hover:underline">
            About
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left side */}
        <section>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Match candidates to <br /> roles with confidence.
          </h1>
          <p className="text-lg mb-4">
            Upload a <strong>Job Description</strong> and your{" "}
            <strong>Resume</strong> to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Discover missing skills for your target role.</li>
            <li>Get a personalized 10-day learning plan.</li>
            <li>Practice with tailored mock interview questions.</li>
          </ul>
        </section>

        {/* Right side (Form) */}
        <section>
          <form
            onSubmit={handleSubmit}
            className="bg-[#111827] p-6 rounded-2xl shadow-lg space-y-4"
          >
            <div>
              <label className="block mb-2 font-medium">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the JD here..."
                className="w-full p-3 rounded-lg bg-[#0a0f1c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Resume (paste text)</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Optional if uploading a file"
                className="w-full p-3 rounded-lg bg-[#0a0f1c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Resume (upload file)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-400 border border-gray-700 rounded-lg cursor-pointer bg-[#0a0f1c] focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted: .pdf, .doc, .docx, .txt
              </p>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              {submitting ? "Submitting..." : "Analyze"}
            </button>
          </form>

          {/* Show result */}
          {result && (
            <div className="mt-6 p-4 bg-[#0a0f1c] border border-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Result</h2>
              <pre className="whitespace-pre-wrap text-sm text-gray-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-800 text-center text-gray-400 text-sm">
        © 2025 Career Path Copilot
      </footer>
    </div>
  );
}

export default App;

