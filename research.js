const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",").map(x => x.trim()).filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin || "";
  const allow = ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);
  if (allow) res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.includes("*") ? "*" : origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "Cafe Preneur Online Research API",
      usage: "POST { query: string, context?: string }",
      configured: Boolean(process.env.TAVILY_API_KEY)
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.TAVILY_API_KEY;
  if (!key) return res.status(503).json({ error: "API belum dikonfigurasi. Tambahkan TAVILY_API_KEY di environment variables hosting." });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const query = String(body?.query || "").trim().slice(0, 500);
  const context = String(body?.context || "").trim().slice(0, 1500);
  if (!query) return res.status(400).json({ error: "Kolom query wajib diisi." });

  const searchQuery = `${query} ${context}`.trim().slice(0, 1000);

  try {
    const upstream = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query: searchQuery,
        search_depth: "basic",
        topic: "general",
        max_results: 6,
        include_answer: true,
        include_raw_content: false
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Tavily error", upstream.status, data);
      return res.status(502).json({ error: "Layanan pencarian online gagal merespons.", detail: data?.detail || data?.message || `HTTP ${upstream.status}` });
    }

    const sources = (Array.isArray(data.results) ? data.results : []).map(item => ({
      title: String(item.title || "Sumber online").slice(0, 240),
      url: String(item.url || ""),
      excerpt: String(item.content || "").slice(0, 900)
    })).filter(item => /^https?:\/\//i.test(item.url));

    let answer = "";
    if (typeof data.answer === "string" && data.answer.trim()) {
      answer = data.answer.trim();
    } else if (sources.length) {
      answer = "Saya menemukan beberapa sumber online yang relevan. Berikut ringkasan awal dari cuplikan hasil pencarian; buka sumber untuk membaca konteks lengkapnya:\\n\\n" +
        sources.slice(0, 4).map((s, i) => `${i + 1}. ${s.title}: ${s.excerpt}`).join("\\n\\n");
    } else {
      answer = "Belum ditemukan sumber yang cukup relevan untuk pertanyaan ini. Coba gunakan kata kunci yang lebih spesifik.";
    }

    return res.status(200).json({
      answer,
      sources,
      query,
      provider: "Tavily Search",
      disclaimer: "Periksa sumber asli dan tanggal publikasi sebelum menggunakan informasi sebagai keputusan bisnis."
    });
  } catch (err) {
    console.error("Research API error", err);
    return res.status(500).json({ error: "Terjadi kesalahan saat mencari sumber online." });
  }
};
