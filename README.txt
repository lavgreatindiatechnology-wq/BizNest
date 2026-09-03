BIZBOOST AI - COMPLETE FIXED PROJECT

IMPORTANT UPLOAD METHOD
1. Download ZIP.
2. Extract ZIP on computer.
3. Open the extracted folder.
4. You will see index.html, site.html, customer.html, assets folder, database folder, admin folder.
5. Select ALL these files/folders.
6. Upload them directly into your GitHub repository.

Do NOT create another extra BizBoostAI_Complete_Fixed folder inside the repository.

CROSS-BROWSER FIX:
Public business URL:
site.html?slug=YOUR-SLUG

Customer Login automatically becomes:
customer.html?slug=YOUR-SLUG

After customer login it returns to:
site.html?slug=YOUR-SLUG

This is why it will not lose the business slug and return to the BizNest home page.

SUPABASE:
Run database/supabase.sql in Supabase SQL Editor if these tables do not already exist.

Note: Each browser has its own Supabase login session. Once logged in, the customer remains logged in in that browser until logout/session expiry.
