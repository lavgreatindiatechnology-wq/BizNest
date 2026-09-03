# BizNest Final Working Setup

## Main website
Only: **Admin Login, Owner Login, Register**.

## Customer login
Customer login is only on each public business website.

## Setup
1. Open `assets/js/config.js` and paste your Supabase URL and Publishable Key.
2. Supabase -> SQL Editor -> run `database/INSTALL_FIRST.sql`.
3. Supabase -> Authentication -> Providers -> enable Email. For easy testing, disable email confirmation.
4. Delete old GitHub project files.
5. Extract this ZIP and upload the CONTENTS directly into the GitHub repository root.

## Test flow
Register Owner -> Owner Login -> Create Business -> Add Products/Services -> Open Public Site -> Customer Login -> Order/Book -> Owner Dashboard sees requests.

## Admin
Register an account, find its UUID in Authentication -> Users, then run:
`update public.profiles set role='admin' where id='YOUR-UUID';`
