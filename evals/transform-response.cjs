module.exports = (json, text, context) => ({
  output: json?.answer || json?.error || text || "",
  metadata: {
    sources: Array.isArray(json?.sources) ? json.sources : [],
    status: context?.response?.status,
  },
});
