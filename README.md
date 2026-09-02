# BizBoost AI Premium
## Added in this version
- Attractive premium business website design
- Customer Login / Customer Account
- Product Order flow
- Service Request flow
- Appointment Booking
- Customer dashboard for orders & requests
- Business owner Customer Orders page
- Business owner Service Requests page
- Confirm / Complete orders
- Accept / Reject requests
- Open Website button
- Copy Website URL button
- Open New Tab button
- Separate public business website page
- Mobile responsive

## Important production note
This GitHub Pages ZIP is a frontend demo using browser localStorage. For real public multi-user orders/login/admin data across all devices, connect Supabase Auth + Database + Storage. The included next production step should replace localStorage with Supabase.

## Customer session
Customer login remains active for 12 hours unless the customer clicks Logout. In this GitHub Pages demo, this is enforced in browser localStorage.

## Session fix
Customer Continue Shopping now keeps the 12-hour customer session active and My Account opens the customer dashboard instead of forcing login again.
