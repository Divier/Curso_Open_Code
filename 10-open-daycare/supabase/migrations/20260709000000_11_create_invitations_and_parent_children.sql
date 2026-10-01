-- SPEC 11: Invitations and parent linking

-- Create relationship_type enum if it doesn't exist (may have been created by prior migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
    CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
  END IF;
END $$;

-- Create invitation_status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Create invitations table
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  relationship relationship_type NOT NULL,
  code text UNIQUE NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create parent_children table
CREATE TABLE parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  relationship relationship_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, child_id)
);

ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- RLS Policies — invitations

-- Read: authenticated users can see invitations from their own daycare
CREATE POLICY "invitations_read_own_daycare" ON invitations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u WHERE u.daycare_id = (
        SELECT r.daycare_id FROM rooms r
        JOIN children c ON c.room_id = r.id
        WHERE c.id = invitations.child_id
      )
    )
  );

-- Write: only staff and admin can create/update/delete invitations
CREATE POLICY "invitations_staff_write" ON invitations
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')
    )
  );

-- RLS Policies — parent_children

-- Read: authenticated users can see parent_children from their own daycare
CREATE POLICY "parent_children_read_own_daycare" ON parent_children
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u WHERE u.daycare_id = (
        SELECT r.daycare_id FROM rooms r
        JOIN children c ON c.room_id = r.id
        WHERE c.id = parent_children.child_id
      )
    )
  );

-- Write: only staff and admin can create/update/delete parent_children
CREATE POLICY "parent_children_staff_write" ON parent_children
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')
    )
  );

-- Parents can see their own links
CREATE POLICY "parent_children_read_own" ON parent_children
  FOR SELECT
  USING (auth.uid() = parent_id);
