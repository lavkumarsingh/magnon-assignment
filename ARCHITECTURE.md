# Architecture Note — AI Workflow Assistant

React UI + Express API. Stateless. The server owns the model call, validation, and routing.

## Architecture

The UI only collects input and displays JSON. The API runs the workflow so browsers cannot skip validation or change the route.

Flow: `POST JSON → LLM assessment → in-memory route map → JSON response`.

The model **judges** (summary, messaging, format, complexity). Code **decides** the route. One prompt that both scores and routes would make policy untestable — wording drift could send the same job to different people. A map can be checked without calling a model.

Two processes (UI + API), no database, no auth. A monolith or a store would add moving parts this assignment does not need. Tradeoff: the HTTP socket stays open until the model returns.

## AI Integration

The system prompt is a role, a scoring rubric, and a JSON contract. Complexity is scored on coordination and review load, not how “important” the brand sounds. The user message is only title and description, so the description cannot rewrite the rubric.

The model is asked for closed JSON (required keys, complexity enum, no extra fields). The server then parses, rejects empty strings and unknown complexity, and fails the request rather than inventing a route. Schema cuts garbage; the second pass is what routing actually trusts.

## Automation Logic

Routing is one lookup after validation — not a second model call and not `if`s in the handler. Policy lives in one map, so it can change without touching prompts.

The map matches **review cost to risk**. High-coordination work is expensive to undo, so it needs a senior stop. Production drafting belongs with the content team. Trivial single-channel work should not clog a human queue. The model estimates complexity; the map is the staffing rule and cannot “creatively” reroute.

## Scaling

The model is assumed to have enough capacity. Per request this app only parses JSON, waits on I/O, and does a map lookup. Node does not block a thread while waiting: the event loop takes the next connection. Daily totals of 1,000 or 10,000 are easy (about 1 and 7 requests per minute). The real limit is **how many sockets are open at once**, not the day count.

- **100/day** — one process, synchronous POST. Timeouts and logs.
- **1,000/day** — still one process. Reverse proxy for keep-alive and body limits. Static UI, API only for workflow.
- **10,000/day** — still low average load. Several Node workers behind a load balancer if peaks open too many connections. Replicas are interchangeable (no session).

**Bursts / enormous concurrent intake:** replicate the stateless API; put the UI on a CDN; return 503 when a host is full. If waits (not CPU) saturate sockets, switch to accept-and-poll: return an id, workers call the LLM, client reads the result later. That is connection management. Routing does not change.

**If the LLM itself is scaled:** keep the same map; add a queue and a worker pool so HTTP is not the thing waiting. Cap in-flight worker calls (backpressure). Cache identical inputs. Retry the job id, not a duplicate POST.
