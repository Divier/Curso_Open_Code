-- SPEC 12: Create posts with images
-- Enums, tables, indexes, RLS policies, and triggers

-- 1. Enums
CREATE TYPE post_type AS ENUM (
  'meal',
  'nap',
  'activity',
  'achievement',
  'mood',
  'photo',
  'announcement'
);

CREATE TYPE post_target AS ENUM ('kid', 'all');

-- 2. Table: posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES daycares(id),
  author_id uuid NOT NULL REFERENCES users(id),
  post_type post_type NOT NULL,
  description text NOT NULL CHECK (char_length(trim(description)) > 0),
  target_type post_target NOT NULL,
  target_child_id uuid REFERENCES children(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. Table: post_images
CREATE TABLE post_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

-- 5. Indexes
CREATE INDEX idx_posts_daycare_created ON posts(daycare_id, created_at DESC);
CREATE INDEX idx_posts_target_child ON posts(target_child_id);
CREATE INDEX idx_post_images_post_sort ON post_images(post_id, sort_order);

-- 4. RLS policies: posts

-- Staff/admin can view all posts from their daycare
CREATE POLICY "staff_select_own_daycare" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.daycare_id = posts.daycare_id
        AND users.role IN ('staff', 'admin')
    )
  );

-- Parents can see posts targeted to "all" in their daycare, or posts targeting their children
CREATE POLICY "parent_select_targeted" ON posts
  FOR SELECT
  USING (
    (
      target_type = 'all'
      AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
          AND users.daycare_id = posts.daycare_id
          AND users.role = 'parent'
      )
    )
    OR (
      target_type = 'kid'
      AND target_child_id IN (
        SELECT pc.child_id FROM parent_children pc
        WHERE pc.parent_id = auth.uid()
      )
    )
  );

-- Staff/admin can insert posts into their own daycare as themselves
CREATE POLICY "staff_insert" ON posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.id = posts.author_id
        AND users.daycare_id = posts.daycare_id
        AND users.role IN ('staff', 'admin')
    )
  );

-- Staff/admin can update their own posts
CREATE POLICY "staff_update_own" ON posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.id = posts.author_id
        AND users.role IN ('staff', 'admin')
    )
  );

-- Staff/admin can delete their own posts
CREATE POLICY "staff_delete_own" ON posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.id = posts.author_id
        AND users.role IN ('staff', 'admin')
    )
  );

-- 4. RLS policies: post_images

-- Anyone with access to the parent post can view its images
CREATE POLICY "select_via_post_access" ON post_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
        AND (
          -- Reuse the same logic: staff/admin see own daycare posts
          EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
              AND u.daycare_id = posts.daycare_id
              AND u.role IN ('staff', 'admin')
          )
          OR
          -- Parents see targeted posts
          (posts.target_type = 'all' AND EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
              AND u.daycare_id = posts.daycare_id
              AND u.role = 'parent'
          ))
          OR
          (posts.target_type = 'kid' AND posts.target_child_id IN (
            SELECT pc.child_id FROM parent_children pc
            WHERE pc.parent_id = auth.uid()
          ))
        )
    )
  );

-- Staff can insert images for posts they authored
CREATE POLICY "staff_insert" ON post_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- Staff can delete images for posts they authored
CREATE POLICY "staff_delete_own" ON post_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_images.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- 6. Trigger: updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_post_images
  BEFORE UPDATE ON post_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
