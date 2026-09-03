BIZNEST WORKING COMPLETE V2

CORRECT LOGIN STRUCTURE

MAIN BIZNEST WEBSITE:
- Admin Login
- Owner Login
- Register Business
- NO Customer Login

CUSTOMER LOGIN:
Customer Login appears ONLY on each business owner's public website:
site.html?slug=business-name

WORKFLOW:
1. Owner registers
2. Owner logs in
3. Owner creates business
4. Owner adds products/services
5. Owner opens public website
6. Customer visits that business website
7. Customer clicks Customer Login on THAT business website
8. Customer orders product or books service
9. Owner sees requests in Owner Dashboard

ADMIN:
- admin-login.html
- admin.html
Run INSTALL_FIRST.sql first.
To make an account admin, register that account, then add its auth user UUID to profiles with role = admin.

UPLOAD:
Extract ZIP and upload ALL files/folders directly to GitHub repository ROOT.
Do not upload the ZIP itself.
Do not create an extra parent folder.
