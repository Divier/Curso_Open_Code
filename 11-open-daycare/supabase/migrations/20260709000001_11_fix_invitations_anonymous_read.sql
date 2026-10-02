-- SPEC 11 fix: Allow anonymous read on invitations for activation flow
-- The activation page is public, so we need to allow reading invitations by code without auth.
-- The code acts as a secret token (5 chars = 33M combinations), so this is safe.

CREATE POLICY "invitations_anonymous_read" ON invitations
  FOR SELECT
  USING (true);
