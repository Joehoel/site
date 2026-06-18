---
title: Effect Web Scraper
description: A type-safe, resilient web scraper built on the Effect ecosystem, using structured concurrency and schema-validated parsing to fetch and normalise data without unhandled failures.
techStack:
  - TypeScript
  - Effect
  - Bun
order: 2
draft: false
---

An exploration of building a production-grade web scraper with Effect. Requests,
retries, and rate-limiting are modelled as composable effects, while parsed
payloads are validated through Effect's `Schema` so malformed responses fail
loudly and early instead of leaking `any` into the rest of the pipeline.
