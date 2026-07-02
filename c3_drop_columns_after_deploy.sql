-- ============================================================================
-- C3 — FINAL STEP. Run this ONLY AFTER the new frontend is deployed to Vercel.
--
-- Why the ordering matters: the new code reads/writes party & tradition from the
-- owner-only `profile_private` table. The *currently deployed* old code still
-- writes these columns to `profiles`. If you drop the columns before the new
-- build is live, the old app's "save profile" will error. Deploy first, confirm
-- profile editing + admin member/support views still work, THEN run this.
--
-- After this runs, party/tradition are no longer readable by other members
-- (they live only in profile_private, which RLS restricts to the owner + admins).
-- `mobile` is dropped as dead (it was never populated in profiles; the signup
-- mobile number lives in auth.users metadata, which is already private).
-- ============================================================================

alter table public.profiles drop column if exists party;
alter table public.profiles drop column if exists tradition;
alter table public.profiles drop column if exists mobile;
