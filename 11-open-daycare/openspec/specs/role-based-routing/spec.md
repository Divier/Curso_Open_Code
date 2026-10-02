## ADDED Requirements

### Requirement: Proxy validates user role and redirects to appropriate section

The proxy SHALL read the user's role from the `users` table on each request and redirect to the appropriate section based on role. Users with role `staff` or `admin` SHALL be directed to `/staff/*`. Users with role `parent` SHALL be directed to `/family/*`.

#### Scenario: Staff user accesses root path
- **WHEN** a user with role `staff` or `admin` navigates to `/`
- **THEN** they are redirected to `/staff`

#### Scenario: Parent user accesses root path
- **WHEN** a user with role `parent` navigates to `/`
- **THEN** they are redirected to `/family`

#### Scenario: Parent user attempts to access staff routes
- **WHEN** a user with role `parent` navigates to any `/staff/*` path
- **THEN** they are silently redirected to `/family`

#### Scenario: Staff user attempts to access family routes
- **WHEN** a user with role `staff` or `admin` navigates to any `/family/*` path
- **THEN** they are silently redirected to `/staff`

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user navigates to any protected path
- **THEN** they are redirected to `/login`

#### Scenario: Authenticated user accesses public route
- **WHEN** an authenticated user navigates to `/login` or `/activate`
- **THEN** they are redirected to `/` (which then redirects based on role)

### Requirement: Role lookup reads from users table directly

The proxy SHALL query the `users` table for the user's role on each request. The role SHALL NOT be cached in JWT claims or cookies.

#### Scenario: Role lookup for authenticated user
- **WHEN** the proxy needs to determine the user's role
- **THEN** it queries `SELECT role FROM users WHERE id = user.id` and uses the result

### Requirement: Public routes remain accessible without authentication

The routes `/login` and `/activate` (and any subpaths) SHALL be accessible without authentication.

#### Scenario: Unauthenticated user visits login
- **WHEN** an unauthenticated user navigates to `/login`
- **THEN** the page loads normally without redirect

#### Scenario: Unauthenticated user visits activate
- **WHEN** an unauthenticated user navigates to `/activate`
- **THEN** the page loads normally without redirect
