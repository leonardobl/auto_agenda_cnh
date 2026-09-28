# controllers

The **Controller** layer. Reads the request (params, query, body, `req.user`), calls a `*Service` from `models/`, and answers with `res.status(...).json(present…(result))` using a function from `views/`.

A controller never imports the database layer or a `*Model`, never holds business rules, and never builds response JSON by hand.
