BIZBOOST AI ONLINE VERSION

यह version localStorage पर नहीं है। Data Supabase में online save होगा.

1. Supabase Dashboard > SQL Editor > New Query
2. database/supabase.sql का पूरा code paste करके Run करें.
3. Authentication > Providers में Email enabled रखें.
4. इस ZIP की सारी files GitHub repository ROOT में upload करें.
5. GitHub Settings > Pages > main > /(root) > Save.

IMPORTANT ADMIN:
पहले अपना account register करें. फिर SQL Editor में:
update profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');

अब admin URL:
/admin/dashboard.html
