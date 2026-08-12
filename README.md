# AI Visibility Score

PROJECT: LocalAI Score

You are helping me build a production-quality SaaS MVP called LocalAI Score.

Do not treat this as a mockup, landing page only, or throwaway prototype.

PRODUCT PURPOSE

LocalAI Score measures the visibility of local businesses in AI-powered discovery/search experiences.

A customer provides:

- business name

- website

- business category

- city

- state

- primary services

The application ultimately runs standardized buyer-intent discovery queries through multiple supported web-grounded AI providers, measures whether the target business and competing businesses appear, calculates a reproducible AI Visibility Score, separately evaluates AI Readiness, and presents the evidence in a clear report.

IMPORTANT PRODUCT PRINCIPLES

1. Never represent the product as a deterministic “ChatGPT ranking.”

2. Never guarantee that optimization will cause an AI system to recommend a business.

3. Visibility Score and Readiness Score are separate.

4. Scores must be calculated deterministically in code from stored evidence, never subjectively assigned by an LLM.

5. Raw scan evidence must be retained so every metric is auditable.

6. All retrieved web content is untrusted input.

7. API keys and provider logic must remain server side.

8. Build the simplest production-quality architecture possible.

9. Do not add unnecessary frameworks or infrastructure.

10. Prepare for future SaaS monitoring and agency workspaces, but DO NOT build those features yet.

TECHNOLOGY

Use Lovable's supported production stack and built-in backend/Cloud.

Use:

- React/TypeScript frontend

- Lovable Cloud / Supabase-compatible backend

- authentication

- PostgreSQL database

- Row Level Security

- server-side edge functions

- built-in payment integration when payments are implemented

- GitHub-compatible code organization

DESIGN

Brand: LocalAI Score

Visual style:

- premium SaaS

- extremely clean

- trustworthy

- analytical

- simple enough for a nontechnical small-business owner

- white/light backgrounds

- charcoal/black typography

- restrained blue/indigo accent

- generous spacing

- no excessive gradients

- no cartoon graphics

- no cliché AI robot imagery

The primary visual should be the score itself.

Create:

1. public landing page

2. pricing page

3. methodology page

4. sign in / signup

5. customer dashboard shell

6. business onboarding/intake

7. scan status page

8. report page shell

LANDING PAGE HERO

Headline:

“Is AI Recommending Your Business—or Your Competitors?”

Subheadline:

“LocalAI Score measures how your business appears when AI is asked the questions your customers might ask.”

Primary CTA:

“Check My Business”

Secondary CTA:

“See How It Works”

The site should clearly explain that AI-generated answers can vary and that LocalAI Score uses standardized tests rather than claiming a permanent AI ranking.

DATA MODEL

Create migration-ready tables for:

profiles

businesses

business_locations

scans

scan_queries

scan_runs

detected_competitors

run_mentions

run_sources

site_audits

score_snapshots

recommendations

report_versions

orders

subscriptions

usage_events

audit_logs

Every user may only access businesses, scans and reports they own unless an explicit admin role permits otherwise.

All applicable tables require RLS.

SCAN STATUS ENUM

created

validating

crawling

profile_ready

generating_queries

running_tests

normalizing_entities

calculating_scores

generating_recommendations

rendering_report

complete

partial

failed

refund_review

SCORING

Visibility Score is 0-100.

Weights:

Recommendation Frequency = 30%

Mention Frequency = 20%

Share of Voice = 15%

Prominence = 15%

Citation/Source Presence = 10%

Consistency = 10%

Do not implement scoring with an LLM.

Implement pure tested TypeScript functions.

Readiness Score is separate.

Readiness dimensions:

business/entity clarity 20

service/location coverage 20

indexability/site fundamentals 15

trust/evidence signals 15

local information consistency 10

third-party footprint 10

structured-data accuracy 5

content/question coverage 5

REPORT

Report should include:

Executive Summary

AI Visibility Score

AI Readiness Score

Methodology

AI engine breakdown

Competitive share of voice

Observed competitors

Query wins

Query losses

Sources/citations

Website readiness findings

Prioritized recommendations

30-day action plan

Methodology disclosure

Do not use fake metrics anywhere in production UI.

Demo/example metrics must be prominently labeled SAMPLE DATA.

SECURITY

Implement:

- strict URL validation

- block localhost/private IP access from website fetching

- authentication

- RLS

- server-only secrets

- input validation

- rate limits where practical

- HTML sanitization

- timeout/retry patterns

- idempotent scan orchestration

- audit logging

- safe error handling

- prompt-injection boundaries for retrieved content

Do not place API secrets in frontend environment variables.

TESTING

Create tests for:

- score calculations

- alias normalization

- competitor detection helpers

- user isolation/RLS assumptions

- invalid URL handling

- duplicate/idempotent scan protection

- failed provider handling

- partial scan handling

FIRST TASK

Before implementing provider integrations, create:

1. architecture

2. database schema/migrations

3. auth

4. public pages

5. dashboard shell

6. business intake

7. deterministic scoring library with tests

Do not invent fake provider APIs.

Leave provider adapters behind clear interfaces ready for Codex to implement using current official API documentation.

After completing this phase, provide:

- what you built

- database tables

- routes

- security controls

- remaining work

- any assumptions

Do not expand scope without explaining why.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://score-your-ai-reach.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c9af3cbb-958b-4e7a-bd3f-dba86eee5790).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
