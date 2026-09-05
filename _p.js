const fs=require('fs');
let s=fs.readFileSync('confirm.js','utf8');
const from = "    const sm = (robots.match(/^Sitemap:\s*(\S+)/m) || [])[1];";
const to = "    /* Match to end of line, not \S+: while the canonical is still a\n       marker the value contains spaces, and \S+ captured only \"[[CONFIRM:\"\n       and reported a mismatch that was not there. */\n    const sm = (robots.match(/^Sitemap:[ \t]*(.+?)[ \t]*$/m) || [])[1];";
if(!s.includes(from)) throw new Error('anchor');
fs.writeFileSync('confirm.js', s.replace(from,to));
console.log('ok');
