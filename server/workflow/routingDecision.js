const ROUTING_MAP = {
  High: "Senior Review",
  Medium: "Content Team",
  Low: "Auto Approve",
};

export function routeRequest(llmOutput) {
  return {
    ...llmOutput,
    routingDecision: ROUTING_MAP[llmOutput.complexity],
  };
}
