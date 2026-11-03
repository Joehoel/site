# AT Protocol article test

This records the bounded test for [issue #88](https://github.com/Joehoel/site/issues/88).
It is not the production publisher requested by [issue #92](https://github.com/Joehoel/site/issues/92).

## Scope and authority

Git and Nuxt Content remain authoritative.
The approved public test used the existing `joelkuijper.me` account, DID `did:plc:eaonwx2kkhteprf62aguraqu`.
It covered one Log publication and the already-public PowerPoint article only.
It did not authorize broader export, blobs, Bluesky announcements, deletion, or website deployment.

The user completed browser OAuth sign-in themselves.
The official SDK handled the approved session outside the repository.
No password, access token, refresh token or private key belongs in content, this manifest, Git, chat, public runtime configuration or browser output.

## Chosen test mapping

| Source                              | AT Protocol representation                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Log at `https://joelkuijper.me/log` | `site.standard.publication` named Log                                                                          |
| Public PowerPoint article           | `site.standard.document` pointing to that publication                                                          |
| Article path                        | `/powerpoint-inverter`, appended to the publication URL                                                        |
| Canonical source                    | `https://joelkuijper.me/log/powerpoint-inverter`                                                               |
| Authored date `2025-01-30`          | `2025-01-30T00:00:00.000Z`, explicit date-only normalization, not a recovered time                             |
| Markdown body                       | Nested `at.markpub.markdown` with `text.$type` equal to `at.markpub.text` and `text.markdown` holding the body |
| Plain text                          | Readable text retaining code and link destinations                                                             |
| Relative body image                 | The same image and alt text with an absolute `https://joelkuijper.me` URL                                      |

The test removed frontmatter through the existing official parser and reused the shared `postSchema`.
It preserved all six Python fences and three source-link occurrences. The only body rewrite made the image URL absolute.
Unknown MDC components and expressions were refused before authentication rather than silently dropped.

## Durable identity and retry behavior

`atproto/article-test.manifest.json` contains the nonsecret identities reserved before any account write.
Do not regenerate its TIDs to retry a failure or rename an article.
The publication TID is `3mzfod6ratk2t`; the document TID is `3mzfod6ratl2t`.
`atproto/article-test.result.json` records their public URIs and returned CIDs.

The experiment used create-only compare-and-swap with `swapRecord: null`.
Existing identical records were no-ops. Different records caused refusal, not replacement.
After an uncertain response, only a read of the same URI could establish success.
The real unchanged rerun made two record reads and zero record writes.
Partial success and uncertain-write recovery passed fake-transport tests; they were not deliberately induced on the live account.

## Reader evidence and remaining gate

[The approved sample is readable in Standard Reader](https://standard-reader.app/a/did%3Aplc%3Aeaonwx2kkhteprf62aguraqu/3mzfod6ratl2t).
The anonymous API preserves the exact Markpub body.
The actual browser renders six highlighted Python blocks with preserved indentation and internal newlines, all three source links and the original image, which loaded at 3200 pixels wide.
CommonMark excludes the closing-fence separator newline from each rendered code block. The record still preserves the source fences verbatim.

Full reader acceptance has not passed.
At the last completed check, the document API had no publication name or original canonical because the owning publication was not indexed.
The reader used its own article URL as canonical instead of the original website URL.
The public account lookup could see Log directly in the repository, but that is not proof of publication indexing.
Do not describe body rendering alone as a successful publication or use this partial result as the go-ahead for unattended export.

## Production decision

Defer the general publisher until the chosen reader resolves the owning publication and preserves the original canonical for this sample.
The existing Content/MDC stack remains in place. There is no CMS migration.

Once that reader gate passes, a separately reviewed implementation must provide:

- Explicit opt-in for already-published Log articles only, with stable identities across source renames and slug changes.
- Stable `publishedAt`, content-sensitive `updatedAt`, exact no-op detection, safe partial retries and a durable managed-record ledger.
- A dry-run showing create, update, unpublish and delete actions. Unknown account records must remain outside its ownership.
- Website verification and ordinary canonical tags, checked against the deployed website before publication is declared successful.
- A single writer in a separate server or CI job with credentials confined to secure secrets. It must resolve the current PDS from the approved identity.
- Explicit approval before destructive managed-record tests. Existing grants do not permit deletion.
- Authoring, deployment, failure, retry and disable instructions.

Do not enable automatic account writes or broaden the sample to work around indexing.
Keep the test records until their owner explicitly approves cleanup. Deletion would not erase copies already made by other services.

## Sources

- [Standard.site document lexicon](https://standard.site/docs/lexicons/document/)
- [Standard.site verification](https://standard.site/docs/verification/)
- [Standard Reader publishing guide](https://standard-reader.app/guide/publishing)
- [Standard Reader API](https://standard-reader.app/docs/api)
- [Standard Reader renderers](https://standard-reader.app/docs/renderers)
