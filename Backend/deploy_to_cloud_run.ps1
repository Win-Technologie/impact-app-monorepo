<#
Simple deploy script for Google Cloud Run.
Edit the variables below, then run this script from any PowerShell prompt.
Requires: gcloud SDK authenticated and billing enabled on the target project.
#>

param()

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RepoRoot = Join-Path $PSScriptRoot ".."
Set-Location $RepoRoot

# --- EDIT THESE VALUES BEFORE RUNNING ---
$PROJECT_ID = Read-Host "GCP Project ID"
$REGION = Read-Host "GCP Region (e.g. us-central1)"
$MONGO_URI = Read-Host "MongoDB Atlas connection string (URLDBCONNECTION)"
$MAINDB = Read-Host "MAINDB (database name)" -DefaultValue "impact_db"
$IMAGE = "gcr.io/$PROJECT_ID/impact-backend"
# ---------------------------------------

Write-Host "Using project: $PROJECT_ID" -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

Write-Host "Submitting Cloud Build (this may take a few minutes)..." -ForegroundColor Cyan
gcloud builds submit --tag $IMAGE .

Write-Host "Deploying to Cloud Run in region $REGION..." -ForegroundColor Cyan
gcloud run deploy impact-backend `
  --image $IMAGE `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --set-env-vars "URLDBCONNECTION=$MONGO_URI,MAINDB=$MAINDB"

Write-Host "Deployment complete. To view the service run:" -ForegroundColor Green
Write-Host "  gcloud run services describe impact-backend --region $REGION --format='value(status.url)'"
