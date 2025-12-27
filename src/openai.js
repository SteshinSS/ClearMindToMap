// OpenAI API integration

import OpenAI from 'openai';

const ANALYSIS_PROMPT = `You are helping someone understand their own thoughts better.

They just finished a "thinking aloud" session where they typed freely without structure. Your job is to:
1. Understand what they were really trying to figure out or process
2. Identify what's weighing on their mind or what they're worried about
3. Structure their scattered thoughts into a clear mind map that gives them clarity

Create a hierarchical markdown mind map using headers (# ## ###) and bullet points.

Choose your own structure based on what would be most helpful for THIS specific person and session. You might organize by:
- The core question or dilemma they're wrestling with. Or there might be several different core questions per session.
- Different perspectives or options they're considering
- Root causes vs symptoms of what's bothering them
- What they can control vs what they can't
- Short-term vs long-term concerns
- Trade-offs
- Or any other structure that fits their thoughts

The goal is to reflect their thoughts back to them in a way that creates an "aha" moment - helping them see their own thinking more clearly.

Rules:
- Be concise but insightful
- Use their own words and phrases where meaningful
- Surface patterns or connections they might not have noticed
- Output ONLY the markdown mind map, no explanations

Your mindmap will be visualized by markmap.js. Here is an example of Markmap features you can use:

\`\`\`
---
title: markmap
markmap:
  colorFreezeLevel: 2
  color: "#2980b9"
  activeNode:
    placement: center
---

## Links

- [Website](https://markmap.js.org/)
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap) for Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) for VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) for Emacs

## Features

Note that if blocks and lists appear at the same level, the lists will be ignored.

### Lists

- **strong** ~~del~~ *italic* ==highlight==
- \`inline code\`
- [x] checkbox
- Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text with the \`maxWidth\` option
- Ordered list
  1. item 1
  2. item 2

### Blocks

\`\`\`js
console.log('hello, JavaScript')
\`\`\`

| Products | Price |
|-|-|
| Apple | 4 |
| Banana | 2 |

![](https://markmap.js.org/favicon.png)
\`\`\`

Their thoughts:
"""
`;

export async function analyzeSession(apiKey, sessionText) {
  if (!apiKey) {
    throw new Error('Please enter your OpenAI API key');
  }

  if (!sessionText.trim()) {
    throw new Error('No thoughts captured yet. Start typing!');
  }

  const client = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  const userPrompt = sessionText + '\n"""';
  const fullPrompt = ANALYSIS_PROMPT + userPrompt;

  console.log('=== SYSTEM PROMPT ===');
  console.log(ANALYSIS_PROMPT);
  console.log('=== USER TEXT ===');
  console.log(sessionText);
  console.log('=== FULL PROMPT ===');
  console.log(fullPrompt);

  const response = await client.responses.create({
    model: 'gpt-5.2',
    reasoning: { effort: "high" },
    input: fullPrompt
  });

  return response.output_text;
}


