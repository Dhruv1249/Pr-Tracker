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
        const parsed = JSON.parse(chatResponse.choices[0].message.content);
        return {
            summary: typeof parsed.summary === 'string' ? parsed.summary : "No summary provided.",
            bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
            codeQuality: Array.isArray(parsed.codeQuality) ? parsed.codeQuality : [],
            performance: Array.isArray(parsed.performance) ? parsed.performance : [],
            inlineFeedback: Array.isArray(parsed.inlineFeedback) ? parsed.inlineFeedback : []
        };
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
        const parsed = JSON.parse(chatResponse.choices[0].message.content);
        const validRisks = ["low", "medium", "high"];
        return {
            riskLevel: validRisks.includes(parsed.riskLevel) ? parsed.riskLevel : "high",
            reason: typeof parsed.reason === 'string' ? parsed.reason : "Failed to parse detailed reason."
        };
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
        const parsed = JSON.parse(chatResponse.choices[0].message.content);
        const validStatuses = ["clean", "flagged"];
        return {
            status: validStatuses.includes(parsed.status) ? parsed.status : "flagged",
            flags: Array.isArray(parsed.flags) ? parsed.flags : ["Failed to parse security flags accurately."]
        };
    } catch (e) {
        return { status: "flagged", flags: ["Failed to parse security assessment from AI."] };
    }
};

const backendBaseUrl = process.env.CORE_SERVICE_URL || 'http://localhost:5002';

export const agentChat = async (query, context = {}, userId, githubId) => {
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

    const systemPromptMessage = `You are an AI assistant for a PR tracking app.

You interact with the user's GitHub data ONLY through the provided tools, which call the backend API.

## STRICT RULES — NO EXCEPTIONS:
1. ALWAYS call the relevant tool before answering questions about repos, PRs, or data.
2. NEVER invent, guess, or hallucinate repository names, PR IDs, repoIds, usernames, or any data.
3. NEVER suggest Git CLI commands (like 'git clone', 'git rebase') unless check_conflicts has confirmed a conflict AND the PR cannot be merged.
4. If a tool call returns an error, you MUST:
   a. Report the exact error to the user (e.g. "Tool 'list_tracked_repos' failed: HTTP 401: ...").
   b. Do NOT attempt to answer using made-up or cached data.
   c. Suggest the appropriate fix:
      - HTTP 401 or "re-authenticate" → tell the user to log out and log back in via GitHub OAuth.
      - HTTP 429 or "rate limit" or "rate (0/" in the error → tell the user GitHub rate limit is exceeded and they need to wait, or re-authenticate to use their personal token.
      - HTTP 404 → the resource doesn't exist.
      - HTTP 5xx → backend error, suggest retrying.
5. 'repoId' for 'list_prs_for_repo' and 'sync_repo' is the INTERNAL _id returned by 'list_tracked_repos', NOT the GitHub repo ID or owner/name.
6. Only confirm a merge conflict by calling 'check_conflicts' first. Never assume a conflict exists.
7. When listing repos or PRs, only reference IDs and names that were actually returned by a tool call in this conversation.

Current context: ${JSON.stringify(context)}`;

    const messages = [
        { role: 'system', content: systemPromptMessage },
        { role: 'user', content: query }
    ];

    let iterationCount = 0;
    const MAX_ITERATIONS = 10;

    while (iterationCount < MAX_ITERATIONS) {
        iterationCount++;
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
                // Ensure dangerous tools are explicitly confirmed by the user in the UI
                const dangerousTools = ["merge_pr", "close_pr", "reopen_pr", "submit_review", "track_repo"];
                if (dangerousTools.includes(functionName)) {
                    if (!context.forceTool || context.forceTool.tool !== functionName) {
                        return `UI_CONFIRMATION_NEEDED:${functionName}:${JSON.stringify(functionArgs)}`;
                    }
                }

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
                    const headers = { "Content-Type": "application/json" };
                    if (userId) {
                        headers["x-user-id"] = userId;
                    }
                    if (githubId) {
                        headers["x-user-github-id"] = githubId;
                    }

                    const fetchConfig = { method, headers };
                    if (body) {
                        fetchConfig.body = JSON.stringify(body);
                    }
                    const response = await fetch(url, fetchConfig);
                    const text = await response.text();
                    
                    // Audit log the AI tool execution
                    try {
                        const auditUrl = `${process.env.API_GATEWAY_URL}/api/db/audit`;
                        await fetch(auditUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-internal-secret": process.env.INTERNAL_SECRET
                            },
                            body: JSON.stringify({
                                action: "AI_TOOL_CALL",
                                actor: `system:ai-agent(user:${githubId})`,
                                target: `tool:${functionName}`,
                                details: { functionArgs, status: response.status }
                            })
                        });
                    } catch (auditErr) {
                        console.error("Failed to audit AI tool call", auditErr);
                    }

                    if (response.ok) {
                        result = text;
                    } else {
                        // Build a descriptive error the model can reason about
                        let errorDetail = text;
                        try {
                            const parsed = JSON.parse(text);
                            errorDetail = parsed.error || parsed.message || text;
                        } catch (_) { /* keep raw text */ }

                        // Flag rate limit errors explicitly so the model can advise correctly
                        const isRateLimit =
                            response.status === 429 ||
                            errorDetail.toLowerCase().includes("rate limit") ||
                            errorDetail.includes("rate (0/");
                        const isAuthError = response.status === 401 || response.status === 403;

                        if (isRateLimit) {
                            result = `TOOL_ERROR [rate_limit]: GitHub API rate limit exceeded. The server may be using unauthenticated requests (60/hr limit). Ask the user to re-authenticate via GitHub OAuth to restore the 5000/hr authenticated rate limit. Raw error: ${errorDetail}`;
                        } else if (isAuthError) {
                            result = `TOOL_ERROR [auth_error HTTP ${response.status}]: Authentication failed. The user's GitHub token may be missing or expired. Ask them to log out and re-authenticate via GitHub OAuth. Raw error: ${errorDetail}`;
                        } else {
                            result = `TOOL_ERROR [HTTP ${response.status}]: ${errorDetail}`;
                        }
                    }
                } else {
                    result = `TOOL_ERROR [not_implemented]: function ${functionName} is not supported.`;
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

    return "Agent reached maximum iterations and stopped to prevent an infinite loop.";
};
