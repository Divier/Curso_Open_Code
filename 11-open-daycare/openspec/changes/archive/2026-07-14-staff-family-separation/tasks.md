## 1. Staff Sidebar and MobileNav

- [x] 1.1 Create `components/staff/StaffSidebar.tsx` with navigation items: Feed (/staff), Niños (/staff/kids), Avisos (/staff/notifications), Mi cuenta (/staff/account) and "Nueva publicación" button
- [x] 1.2 Create `components/staff/StaffMobileNav.tsx` using StaffSidebar content for mobile menu

## 2. Family Sidebar and MobileNav

- [x] 2.1 Create `components/family/FamilySidebar.tsx` with navigation items: Feed (/family), Resumen del día (/family/day-summary), Mi cuenta (/family/account) — no "Nueva publicación" button
- [x] 2.2 Create `components/family/FamilyMobileNav.tsx` using FamilySidebar content for mobile menu

## 3. Staff Layout and Pages

- [x] 3.1 Create `app/staff/layout.tsx` with StaffSidebar, StaffMobileNav, and main content area
- [x] 3.2 Create `app/staff/page.tsx` by migrating current `app/page.tsx` (FeedClient adapted for staff with post creation)
- [x] 3.3 Move `app/kids/` directory to `app/staff/kids/` (including `[id]/page.tsx`)
- [x] 3.4 Create `app/staff/notifications/page.tsx` as placeholder
- [x] 3.5 Create `app/staff/account/page.tsx` as placeholder

## 4. Family Layout and Pages

- [x] 4.1 Create `app/family/layout.tsx` with FamilySidebar, FamilyMobileNav, and main content area
- [x] 4.2 Create `app/family/page.tsx` with family feed (filtered by parent's children)
- [x] 4.3 Create `app/family/day-summary/page.tsx` as placeholder
- [x] 4.4 Create `app/family/account/page.tsx` as placeholder

## 5. Family Feed Query

- [x] 5.1 Create `getFamilyPosts(userId)` function in `app/_queries/posts.ts` that filters posts by parent's children and room announcements
- [x] 5.2 Add child filter pills UI to family feed (filter by each child + "Todos" option)

## 6. Proxy Role-Based Routing

- [x] 6.1 Update `proxy.ts` to read user role from `users` table via query
- [x] 6.2 Add redirect logic: `/` → `/staff` or `/family` based on role
- [x] 6.3 Add redirect logic: `/staff/*` → `/family` if user is parent
- [x] 6.4 Add redirect logic: `/family/*` → `/staff` if user is staff/admin

## 7. Cleanup and Path Updates

- [x] 7.1 Delete `app/page.tsx` (root now redirects via proxy)
- [x] 7.2 Update `revalidatePath('/kids')` to `revalidatePath('/staff/kids')` in `app/_actions/children.ts`
- [x] 7.3 Delete `components/shared/Sidebar.tsx` (replaced by StaffSidebar and FamilySidebar)
- [x] 7.4 Delete `components/shared/MobileNav.tsx` (replaced by StaffMobileNav and FamilyMobileNav)
- [x] 7.5 Update any remaining imports that reference deleted components
