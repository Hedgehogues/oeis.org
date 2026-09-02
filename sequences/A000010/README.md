# A000010 — Euler's totient function

`a(n) = phi(n)` counts the positive integers `<= n` that are coprime to `n`: `1, 1, 2, 2, 4, 2, 6,
4, 6, 4, …`. The naive question ("count coprimes one by one") gives no handle on why `phi(n)` has
the closed form it does. The page's central claim: `phi(n) = n * product over distinct prime
factors p of n of (1 - 1/p)` — one multiplicative pass per distinct prime, each one striking out
exactly the fraction of survivors that prime rules out.

## Approach

`solution.mjs` computes `phi(n)` by the direct definition — count `k` in `1..n` with `gcd(k,n)=1` —
read straight from the definition, no product formula, no factorization.

Status: **reproduces OEIS exactly** for `phi(1)..phi(69)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02) with four independent checks: the **product formula**, re-derived via trial-division
factorization (a structurally different computation from counting gcds) agreeing with the direct
count for every `n=1..1000`; the **prime case** `phi(p)=p-1`, holding for all 168 primes up to
`n=1000`; **multiplicativity** `phi(a*b)=phi(a)*phi(b)` for coprime `a,b`, checked on 409 actual
coprime pairs up to `n=1000`; and agreement with OEIS's own `%S`/`%T`/`%U` line fetched live from
`oeis.org/search?q=id:A000010&fmt=text`. `solution.mjs`'s direct count is `O(n)` per term (`O(n²)`
for a full prefix table by this naive method): `n=300` in 4 ms, `n=3,000` in 145 ms — not a wall,
just the cost of counting one by one rather than factoring.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000010.md).

## The ideas behind it

One device, new to the catalog (full write-up:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

**Totient sieve strip** — every integer `1..n` as one cell; one pass per distinct prime factor,
striking survivors that are multiples of it, captioning the fraction removed. The product formula's
`(1 - 1/p)` becomes a visible pass over the strip rather than a term taken on faith.
[`[device::TotientSieveStrip]`](../../memory-bank/_terms.md#devicetotientsievestrip)

[![Totient sieve strip](../../memory-bank/visualizations/A000010/screenshots/strike5.png)](../../memory-bank/visualizations/A000010/viz.html)

The device draws exactly the worked example Wikipedia's own article on Euler's totient function
states in prose — `n=20`: "half... are divisible by 2, leaving ten; a fifth of those are divisible
by 5, leaving eight" — as an actual strip of struck and surviving cells, not a restated sentence.

## Build & run

```
node sequences/A000010/solution.mjs 69      # compute phi(1..69) from the definition
node sequences/A000010/proof.mjs 1000       # re-check via the product formula, prime case, multiplicativity
```

## The page these pictures come from

[![One prime at a time](../../memory-bank/visualizations/A000010/screenshots/full.png)](../../memory-bank/visualizations/A000010/viz.html)

The page runs Problem (how many of `1..20` share no factor with 20?) → 1 (the distinct prime
factors of 20 are just 2 and 5) → 2 (strike every multiple of 2 — half gone, 10 left) → 3 (strike
every multiple of 5 still standing — a fifth of what's left, 8 remain) → Solution (8 survivors,
matching the product formula computed independently in `proof.mjs`, and a verified-match badge).

**[Open it live →](../../memory-bank/visualizations/A000010/viz.html)** — every cell, every strike
and the product formula's own numbers come from the same functions in the page's own script,
computed at load time, both themes, the same visual system as every other sequence here.

Source: [oeis.org/A000010](https://oeis.org/A000010)
