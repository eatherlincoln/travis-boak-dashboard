-- Create cron job to automatically update YouTube stats every hour
SELECT cron.schedule(
  'update-youtube-stats-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://gmprigvmotrdrayxacnl.supabase.co/functions/v1/fetch-youtube-stats',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcHJpZ3Ztb3RyZHJheXhhY25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODkxNDIsImV4cCI6MjA3MTA2NTE0Mn0.PVYIhlkbkSNX6h8bx8G9fHuntB2P1R1lOLh6B587SX4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);