# Railway recovery runbook

## Incident: 2026-10-22

A Railway platform incident took down every Railway-hosted app for about two days. Nothing alerted. The uptime monitor (`.github/workflows/uptime.yml`) now runs on GitHub Actions every 15 minutes and opens an `Uptime: N service(s) down` issue when a check fails.

## Symptom

Railway URLs and custom domains return a 404 with this body:

```json
{"status":"error","code":404,"message":"Application not found"}
```

## Fix

1. For each failed service, find its last good deployment in the Railway dashboard or API.
2. Roll it back to that image with the Railway GraphQL API (`https://backboard.railway.com/graphql/v2`, bearer token from `railway login`):

   ```graphql
   mutation { deploymentRollback(id: "DEPLOYMENT_ID") }
   ```

3. Pace the requests one service at a time. Railway rate-limits bursts with "rolling back too quickly".
4. If a service's old image was purged, the rollback fails. Redeploy it instead:

   ```graphql
   mutation { serviceInstanceRedeploy(serviceId: "SERVICE_ID", environmentId: "ENVIRONMENT_ID") }
   ```

## Verify

Run `python3 uptime/check.py` locally, or dispatch the `Uptime` workflow. Every line should read `OK`. The open uptime issue closes itself with "All services recovered" on the next passing scheduled run.
