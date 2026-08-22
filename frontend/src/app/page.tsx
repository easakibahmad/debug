"use client";

import { FormEvent, useState } from "react";
import "./globals.css";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/submit-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      // BUG 1: fetch() does not throw on HTTP 500 — we check data.success instead of response.ok
      // BUG 2: when the API returns 500, data.success is undefined so we never enter this block
      //         and isLoading is never reset — the button stays on "Loading..."
      // BUG 3: no error message is shown to the user on failure
      if (data.success) {
        setSuccessMessage(data.message ?? "Submitted successfully!");
        setIsLoading(false);
      }
    } catch (error) {
      // Only network errors land here — API 500 responses never reach this catch
      console.error("Request failed:", error);
    }
  }

  // Fix option: check response.ok and use finally block
  /*
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/submit-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSuccessMessage(data.message || "Submitted successfully!");
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }
  */

  return (
    <main className="container">
      <div className="debugger-header">
        <div className="mac-buttons">
          <span className="btn close"></span>
          <span className="btn minimize"></span>
          <span className="btn maximize"></span>
        </div>
        <div className="title-bar">debug.exe — Contact Module</div>
      </div>

      <div className="debugger-body">
        <h1>Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner">⏳</span> Processing...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>

        {successMessage && <p className="status-message success">{successMessage}</p>}
        {errorMessage && <p className="status-message error">{errorMessage}</p>}
      </div>
    </main>
  );
}

