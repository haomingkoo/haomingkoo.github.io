module.exports = (_output, context) => {
  const expected = context.config.url;
  const metadata = context.metadata || context.providerResponse?.metadata || context.result?.response?.metadata || {};
  const sources = metadata.sources || [];
  const pass = sources.some(({ url }) => url === expected || url.startsWith(expected));
  return {
    pass,
    score: pass ? 1 : 0,
    reason: pass ? `Returned ${expected}` : `Expected ${expected}; received ${sources.map(({ url }) => url).join(", ") || "no sources"}`,
  };
};
