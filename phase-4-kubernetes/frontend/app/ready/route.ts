/**
 * Readiness check endpoint for Kubernetes readiness probe.
 *
 * Returns 200 if the service is ready to accept traffic.
 * Used by Kubernetes readiness probe to determine if the pod should receive requests.
 * For frontend, this is a simple check as there are no external dependencies to verify.
 */
export async function GET() {
  return Response.json({ status: "ready" });
}
