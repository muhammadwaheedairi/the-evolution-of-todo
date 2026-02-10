/**
 * Health check endpoint for Kubernetes liveness probe.
 *
 * Returns 200 if the service process is alive and running.
 * Used by Kubernetes liveness probe to determine if the pod should be restarted.
 * This is a simple check that doesn't verify external dependencies.
 */
export async function GET() {
  return Response.json({ status: "healthy" });
}
