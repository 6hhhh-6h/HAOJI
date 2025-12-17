const { execSync } = require('child_process');
const fs = require('fs');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    return out.split('\n').filter(Boolean);
  } catch (_) { return []; }
}

function scanFile(path) {
  const text = fs.readFileSync(path, 'utf8');
  const rules = [
    { name: 'OpenAI Key', regex: /sk-[A-Za-z0-9]{20,}/ },
    { name: 'Bearer Token', regex: /Bearer\s+[A-Za-z0-9]{20,}/ },
    { name: 'Generic API Key', regex: /(API[_-]?KEY|apiKey)\s*[=:]\s*["'][A-Za-z0-9]{20,}["']/i },
  ];
  const allowList = [/Authorization\':\s*'Bearer '\s*\+/];
  for (const allow of allowList) { if (allow.test(text)) return null; }
  for (const rule of rules) {
    const m = text.match(rule.regex);
    if (m) return { rule: rule.name, match: m[0] };
  }
  return null;
}

const files = getStagedFiles();
const problems = [];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const p = scanFile(f);
  if (p) problems.push({ file: f, ...p });
}

if (problems.length) {
  console.error('\n[Secret Scan] 检测到可能的敏感信息：');
  for (const p of problems) {
    console.error(`- ${p.file}: ${p.rule} -> ${p.match.slice(0, 8)}...`);
  }
  console.error('\n提交已被阻止。请移除硬编码密钥或改用本地安全存储。');
  process.exit(1);
}
process.exit(0);