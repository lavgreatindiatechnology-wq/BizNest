UPLOAD INSTRUCTIONS
1. Extract ZIP.
2. Open extracted folder.
3. Select ALL files and folders inside it.
4. Upload them to the ROOT of your GitHub repository.
5. Do NOT upload the outer BizBoostAI_Fixed folder itself.
6. GitHub Pages: Settings -> Pages -> Deploy from branch -> main -> /(root).

CROSS-BROWSER FIX:
site.html?slug=BUSINESS-SLUG
keeps the same slug when Customer Login is clicked.
After customer login it returns to the same business website.

Supabase Auth login sessions are browser-specific. A different browser normally needs one login, then it remains logged in there until logout/session expiry.
