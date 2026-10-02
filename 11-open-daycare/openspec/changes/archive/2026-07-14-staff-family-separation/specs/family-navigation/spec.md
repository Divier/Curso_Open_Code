## ADDED Requirements

### Requirement: Family section has dedicated layout with sidebar

The family section at `/family/*` SHALL use a dedicated layout that includes a family-specific sidebar and mobile navigation. The sidebar SHALL display navigation items: Feed (`/family`), Resumen del día (`/family/day-summary`), and Mi cuenta (`/family/account`). The sidebar SHALL NOT include a "Nueva publicación" button.

#### Scenario: Parent user visits family section
- **WHEN** a parent user navigates to `/family`
- **THEN** they see the family layout with sidebar showing Feed, Resumen del día, and Mi cuenta

#### Scenario: Family sidebar highlights active route
- **WHEN** a parent user is on `/family/day-summary`
- **THEN** the "Resumen del día" item in the sidebar is visually highlighted as active

### Requirement: Family day summary page exists

A day summary page SHALL exist at `/family/day-summary` for parents to view a summary of their children's day.

#### Scenario: Parent visits day summary
- **WHEN** a parent user navigates to `/family/day-summary`
- **THEN** they see the day summary page (placeholder for now)

### Requirement: Family account page exists

An account settings page SHALL exist at `/family/account` for parents to manage their profile and preferences.

#### Scenario: Parent visits account page
- **WHEN** a parent user navigates to `/family/account`
- **THEN** they see their account settings page (placeholder for now)
