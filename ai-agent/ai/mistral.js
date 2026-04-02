import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });
const model = 'devstral-2512';

export const generateReview = async (diff) => {
    const prompt = `You are an expert Staff-level software engineer performing a code review.
Analyze the following pull request diff and return a thorough review as a single valid JSON object.

Return ONLY valid JSON with exactly this schema — no markdown, no extra text:
{
  "summary": "A 2-4 sentence explanation of what this PR does.",
  "bugs": [
    { "title": "Short title of the issue", "detail": "Full explanation of the bug or edge case." }
  ],
  "codeQuality": [
    { "title": "Short title", "detail": "Full explanation of the quality issue or suggestion." }
  ],
  "performance": [
    { "title": "Short title", "detail": "Full explanation of the performance or security concern." }
  ],
  "inlineFeedback": [
    { "file": "filename or empty string", "code": "relevant code snippet", "suggestion": "What to change and why." }
  ]
}

Rules:
- Each array can have 0 or more items. Use an empty array [] if nothing is found.
- Keep "title" fields short (under 8 words).
- Keep "detail" and "suggestion" fields thorough and specific.
- For "inlineFeedback", quote real code from the diff in "code".
- Do NOT wrap the JSON in markdown code fences.

Diff to analyze:
${diff}`;

    const chatResponse = await client.chat.complete({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: "json_object" },
    });

    try {
        return JSON.parse(chatResponse.choices[0].message.content);
    } catch (e) {
        // Fallback: return a minimal valid object
        return { summary: chatResponse.choices[0].message.content, bugs: [], codeQuality: [], performance: [], inlineFeedback: [] };
    }

};

export const assessRisk = async (diff) => {
    const prompt = `Analyze the following pull request diff and assess its risk level. Risk level must be exactly one of: "low", "medium", or "high". 
Return ONLY a valid JSON object matching this schema:
{
  "riskLevel": "low" | "medium" | "high",
  "reason": "Brief explanation of the risk assessment"
}

Diff:
${diff}`;

    const chatResponse = await client.chat.complete({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: "json_object" }
    });

    try {
        return JSON.parse(chatResponse.choices[0].message.content);
    } catch (e) {
        return { riskLevel: "high", reason: "Failed to parse risk assessment from AI." };
    }
};

export const detectSecurity = async (diff) => {
    const prompt = `Analyze the following pull request diff for security vulnerabilities.
Return ONLY a valid JSON object matching this schema:
{
  "status": "clean" | "flagged",
  "flags": ["list of brief descriptions of vulnerabilities found, if any"]
}

Diff:
${diff}`;

    const chatResponse = await client.chat.complete({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: "json_object" }
    });

    try {
        return JSON.parse(chatResponse.choices[0].message.content);
    } catch (e) {
        return { status: "flagged", flags: ["Failed to parse security assessment from AI."] };
    }
};

const backendBaseUrl = process.env.CORE_SERVICE_URL || 'http://localhost:5005';

export const agentChat = async (query, context = {}, authHeader) => {
    // Defines tools that correspond to the main backend API
    const tools = [
        {
            type: "function",
            function: {
                name: "merge_pr",
                description: "Merge a pull request",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" }
                    },
                    required: ["prId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "close_pr",
                description: "Close a pull request",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" }
                    },
                    required: ["prId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "reopen_pr",
                description: "Reopen a closed pull request",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" }
                    },
                    required: ["prId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "submit_review",
                description: "Submit a review on a pull request",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" },
                        decision: { type: "string", description: "The decision, must be 'approve', 'request_changes', or 'comment'." },
                        comment: { type: "string", description: "Optional review comment." }
                    },
                    required: ["prId", "decision"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "list_user_repos",
                description: "List all repositories the user has access to on GitHub",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        },
        {
            type: "function",
            function: {
                name: "sync_repo",
                description: "Syncs a tracked repository to fetch the latest pull requests (including closed ones) from GitHub into the system.",
                parameters: {
                    type: "object",
                    properties: {
                        repoId: { type: "string", description: "The internal ID of the repository" }
                    },
                    required: ["repoId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "list_tracked_repos",
                description: "List all repositories currently tracked in the PR Tracker system",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        },
        {
            type: "function",
            function: {
                name: "track_repo",
                description: "Start tracking a GitHub repository in the PR Tracker system",
                parameters: {
                    type: "object",
                    properties: {
                        owner: { type: "string", description: "The owner of the repository" },
                        name: { type: "string", description: "The name of the repository" }
                    },
                    required: ["owner", "name"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "list_prs_for_repo",
                description: "List all pull requests for a specific tracked repository",
                parameters: {
                    type: "object",
                    properties: {
                        repoId: { type: "string", description: "The internal ID of the repository (not GitHub's ID)" }
                    },
                    required: ["repoId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_pr_details",
                description: "Get general details about a specific pull request in the system",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" }
                    },
                    required: ["prId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_pr_diff",
                description: "Get the raw diff / changes/ files for a pull request",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" }
                    },
                    required: ["prId"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "check_conflicts",
                description: "Check if a pull request has merge conflicts",
                parameters: {
                    type: "object",
                    properties: {
                        prId: { type: "string", description: "The internal ID of the pull request" }
                    },
                    required: ["prId"]
                }
            }
        }
    ];

    const systemPromptMessage = `You are a highly capable autonomous AI agent managing Github Pull Requests for a user.
You HAVE direct access to GitHub through your provided tools. NEVER say you cannot access or manipulate GitHub repositories directly.
If the user asks you to perform an action that you have a tool for (like merging, closing, reopening, checking conflicts), you MUST use that tool.
If the user asks you to perform an action you DO NOT have a tool for (like automatically resolving git conflicts), tell them you cannot resolve it automatically.
HOWEVER, if you detect a merge conflict (e.g. via 'check_conflicts' returning mergeable: false), you MUST immediately use the 'get_pr_diff' tool to analyze the Pull Request's code changes. You must then explain exactly which files and changes are likely causing the conflict, and provide the user with step-by-step terminal commands (like git pull, git checkout, git merge) on how they can fix the conflict locally.
IMPORTANT: The 'repoId' required for 'list_prs_for_repo' and 'sync_repo' is the INTERNAL 'repoId' found by calling 'list_tracked_repos'. DO NOT pass GitHub names like "Dhruv1249/expense-server" as a repoId. Use the correct internal id (e.g. "a54b...").
Current context: ${JSON.stringify(context)}`;

    const messages = [
        { role: 'system', content: systemPromptMessage },
        { role: 'user', content: query }
    ];

    while (true) {
        const chatResponse = await client.chat.complete({
            model: model,
            messages: messages,
            tools: tools,
            toolChoice: "auto",
        });

        messages.push(chatResponse.choices[0].message);

        const toolCalls = chatResponse.choices[0].message.toolCalls;
        if (!toolCalls || toolCalls.length === 0) {
            return chatResponse.choices[0].message.content; // Final answer
        }

        // Execute tool calls
        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            let result = "";
            let url = "";
            let method = "POST";
            let body = null;

            try {
                if (functionName === "merge_pr") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}/merge`;
                } else if (functionName === "close_pr") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}/close`;
                } else if (functionName === "reopen_pr") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}/reopen`;
                } else if (functionName === "submit_review") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}/reviews`;
                    body = { decision: functionArgs.decision, comment: functionArgs.comment || "" };
                } else if (functionName === "list_user_repos") {
                    url = `${backendBaseUrl}/api/repos`;
                    method = "GET";
                } else if (functionName === "list_tracked_repos") {
                    url = `${backendBaseUrl}/api/repos/tracked`;
                    method = "GET";
                } else if (functionName === "sync_repo") {
                    url = `${backendBaseUrl}/api/repos/${functionArgs.repoId}/sync`;
                    method = "POST";
                } else if (functionName === "track_repo") {
                    url = `${backendBaseUrl}/api/repos/track`;
                    body = { owner: functionArgs.owner, name: functionArgs.name };
                } else if (functionName === "list_prs_for_repo") {
                    url = `${backendBaseUrl}/api/repos/${functionArgs.repoId}/prs`;
                    method = "GET";
                } else if (functionName === "get_pr_details") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}`;
                    method = "GET";
                } else if (functionName === "check_conflicts") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}/conflicts`;
                    method = "GET";
                } else if (functionName === "get_pr_diff") {
                    url = `${backendBaseUrl}/api/prs/${functionArgs.prId}/diff`;
                    method = "GET";
                }

                if (url) {
                    const fetchConfig = {
                        method,
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": authHeader || ""
                        }
                    };
                    if (body) {
                        fetchConfig.body = JSON.stringify(body);
                    }
                    const response = await fetch(url, fetchConfig);
                    result = await response.text();
                } else {
                    result = `Error: function ${functionName} not supported locally.`;
                }
            } catch (err) {
                result = `Error executing tool: ${err.message}`;
            }

            messages.push({
                role: 'tool',
                name: functionName,
                content: result,
                toolCallId: toolCall.id,
            });
        }
    }
};
