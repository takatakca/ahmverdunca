const glob = new Bun.Glob("src/**/*.tsx");
const errors: string[] = [];

for await (const file of glob.scan(".")) {
  const source = await Bun.file(file).text();
  const anchors = source.match(/<a\b[\s\S]*?>/g) ?? [];
  for (const anchor of anchors) {
    if (!/target=["']_blank["']/.test(anchor)) continue;
    const rel = anchor.match(/rel=["']([^"']+)["']/)?.[1]?.split(/\s+/) ?? [];
    if (!rel.includes("noopener") || !rel.includes("noreferrer")) {
      errors.push(`${file} contains target="_blank" without rel="noopener noreferrer".`);
    }
  }
}

if (errors.length) {
  console.error("External-link safety validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("External-link safety validation passed.");
