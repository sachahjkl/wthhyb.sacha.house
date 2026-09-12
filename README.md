# bun-react-tailwind-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Deployment

GitHub Actions checks pull requests and accepted `master` commits on `ubuntu-latest`. An accepted commit publishes one immutable GHCR image.

The production workflow promotes the exact image digest running on staging after approval. Nomad jobs live in `deploy`.
