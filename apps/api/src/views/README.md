# views

The **View** layer. The API renders no HTML, so a view is a pure function that turns a Model result into the exact JSON sent to the client (`presentStudent`, `presentPage`, `presentError`, …).

Fields are listed one by one, so nothing (e.g. `password_hash`) leaves the API unless it is named here. No Express, no SQLite.
