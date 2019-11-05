#!/usr/bin/env bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres

#run nodemon
npx nodemon index.js