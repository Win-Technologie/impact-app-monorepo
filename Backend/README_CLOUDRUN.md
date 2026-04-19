# Deploy Backend to Google Cloud Run

This document describes the steps to build and deploy the `Backend` service to Google Cloud Run.

Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated: `gcloud init` / `gcloud auth login`
- A GCP project with billing enabled
- MongoDB Atlas reachable from Cloud Run (configure Network Access in Atlas)

Quick steps
1. From the repo root, run the provided PowerShell deploy script and follow prompts:
   ```powershell
   cd Backend
   .\deploy_to_cloud_run.ps1
   ```

   The script will:
   - build and push a container image to `gcr.io/<PROJECT_ID>/impact-backend`
   - deploy the image to Cloud Run as `impact-backend`
   - set `URLDBCONNECTION` and `MAINDB` environment variables on the service

Manual alternative (one-liners)
1. From the repository root, submit a Cloud Build and tag the image:
   ```powershell
   gcloud config set project <PROJECT_ID>
   gcloud builds submit --tag gcr.io/<PROJECT_ID>/impact-backend .
   ```
2. Deploy to Cloud Run (public):
   ```powershell
   gcloud run deploy impact-backend --image gcr.io/<PROJECT_ID>/impact-backend --platform managed --region <REGION> --allow-unauthenticated
   ```
3. Set environment variables (example):
   ```powershell
   gcloud run services update impact-backend --region <REGION> --set-env-vars URLDBCONNECTION="<MONGODB_URI>",MAINDB="impact_db"
   ```

Post-deploy
- Get the service URL:
  ```powershell
  gcloud run services describe impact-backend --region <REGION> --format='value(status.url)'
  ```
- Verify the API is reachable:
  ```powershell
  curl https://<your-cloud-run-url>/api/
  ```

Notes & gotchas
- This repository uses a local dependency reference in `Backend/package.json` (`file:..`). The Dockerfile copies the repository root into the image so local package references resolve correctly. Build context must be the repo root (the included `deploy_to_cloud_run.ps1` submits from repo root).
- For production, do NOT leave MongoDB Atlas IP whitelist set to `0.0.0.0/0` — configure proper IP allowlists or VPC peering.
- Use Secret Manager or Cloud Run environment variables for sensitive values.
