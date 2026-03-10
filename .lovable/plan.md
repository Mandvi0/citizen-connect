

## Plan: Add Citizen Profile Page (`/citizen/profile`)

### What We'll Build

A profile page at `/citizen/profile` that fetches user data from the `auth/me` backend endpoint and displays it. The page will include:

- Same header as other citizen pages (CivicConnect branding, nav icons)
- User avatar with initials fallback
- Profile info card showing name, email, ID, and role
- Edit profile section (placeholder for future functionality)
- Logout button
- Back navigation to dashboard

### Technical Approach

1. **Create `src/pages/citizen/Profile.tsx`**
   - Fetch user data from backend `auth/me` endpoint using `fetch` (or mock data as fallback since no backend is connected yet)
   - Display: avatar (initials), name, email, role badge, account ID
   - Include sections: Account Information, Settings (language preference placeholder), and a Logout action
   - Reuse the same header pattern from `Dashboard.tsx`

2. **Add route in `App.tsx`**
   - Add `<Route path="/citizen/profile" element={<CitizenProfile />} />`

3. **Update Dashboard's User icon**
   - Make the `<User>` icon button in `Dashboard.tsx` navigate to `/citizen/profile`

### Data Format (from `auth/me`)
```json
{ "name": "harsh", "email": "harshmishra9933@gmail.com", "id": 1, "role": "user" }
```

Since no backend URL is configured yet, we'll use mock data matching this format with a TODO comment for the actual API call.

