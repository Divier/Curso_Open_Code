## ADDED Requirements

### Requirement: Staff section has dedicated layout with sidebar

The staff section at `/staff/*` SHALL use a dedicated layout that includes a staff-specific sidebar and mobile navigation. The sidebar SHALL display navigation items: Feed (`/staff`), Niños (`/staff/kids`), Avisos (`/staff/notifications`), and Mi cuenta (`/staff/account`).

#### Scenario: Staff user visits staff section
- **WHEN** a staff user navigates to `/staff`
- **THEN** they see the staff layout with sidebar showing Feed, Niños, Avisos, and Mi cuenta

#### Scenario: Staff sidebar highlights active route
- **WHEN** a staff user is on `/staff/kids`
- **THEN** the "Niños" item in the sidebar is visually highlighted as active

### Requirement: Staff sidebar includes new post button

The staff sidebar SHALL include a "Nueva publicación" button that opens the new post modal. This button SHALL NOT appear in the family sidebar.

#### Scenario: Staff user clicks new post button
- **WHEN** a staff user clicks "Nueva publicación" in the sidebar
- **THEN** the new post modal opens

### Requirement: Staff kids page is accessible at /staff/kids

The kids management page SHALL be available at `/staff/kids` and `/staff/kids/[id]`. It SHALL display all children grouped by room and allow staff to view individual child profiles.

#### Scenario: Staff visits kids page
- **WHEN** a staff user navigates to `/staff/kids`
- **THEN** they see all children grouped by room with options to add or manage children

#### Scenario: Staff visits child profile
- **WHEN** a staff user navigates to `/staff/kids/[id]`
- **THEN** they see the child's profile including name, allergies, and linked parents

### Requirement: Staff notifications page exists

A notifications page SHALL exist at `/staff/notifications` for staff to view recent activity and announcements.

#### Scenario: Staff visits notifications
- **WHEN** a staff user navigates to `/staff/notifications`
- **THEN** they see the notifications page (placeholder for now)

### Requirement: Staff account page exists

An account settings page SHALL exist at `/staff/account` for staff to manage their profile settings.

#### Scenario: Staff visits account page
- **WHEN** a staff user navigates to `/staff/account`
- **THEN** they see their account settings page (placeholder for now)
