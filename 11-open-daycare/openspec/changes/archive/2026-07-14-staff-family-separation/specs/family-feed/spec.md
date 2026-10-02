## ADDED Requirements

### Requirement: Family feed shows only posts related to user's children

The family feed at `/family` SHALL display only posts that are related to the logged-in parent's children. Posts are considered related if their `target_child_id` matches one of the parent's children (via `parent_children` table) or if they are general room announcements (`target_type = 'room'`).

#### Scenario: Parent sees posts for their children
- **WHEN** a parent with children Mateo and Sofía visits `/family`
- **THEN** they see posts where `target_child_id` is Mateo's or Sofía's ID, plus room announcements

#### Scenario: Parent with no children sees room announcements
- **WHEN** a parent with no linked children visits `/family`
- **THEN** they see only room announcements (posts with `target_type = 'room'`)

#### Scenario: Parent sees no posts when none exist
- **WHEN** a parent visits `/family` and there are no related posts
- **THEN** they see a message indicating there are no posts yet

### Requirement: Family feed includes child filter pills

The family feed SHALL display filter pills for each of the parent's children plus a "Todos" option. Selecting a child filter SHALL show only posts related to that specific child. Selecting "Todos" SHALL show posts for all children.

#### Scenario: Parent filters by specific child
- **WHEN** a parent with children Mateo and Sofía clicks the "Mateo" filter pill
- **THEN** the feed shows only posts related to Mateo

#### Scenario: Parent selects "Todos" filter
- **WHEN** a parent clicks the "Todos" filter pill
- **THEN** the feed shows posts for all their children plus room announcements

### Requirement: Family feed does not include post creation

The family feed SHALL NOT include any button, modal, or interface element for creating new posts. Post creation is exclusive to the staff section.

#### Scenario: Parent views family feed
- **WHEN** a parent visits `/family`
- **THEN** they see posts but no "Nueva publicación" button or compose interface

### Requirement: Family feed uses getFamilyPosts query

The family feed SHALL use a dedicated `getFamilyPosts(userId)` server function that queries posts filtered by the parent's children and room announcements, rather than the general `getPosts()` function used by staff.

#### Scenario: getFamilyPosts returns correct posts
- **WHEN** `getFamilyPosts(parentId)` is called
- **THEN** it returns posts where `target_child_id` is in the parent's children list OR `target_type = 'room'`, ordered by `created_at` descending
