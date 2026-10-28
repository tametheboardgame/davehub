# DH-10D: Default-off DaveHub markers in new repositories

**Policy from 28 October 2026:** Any newly created `tametheboardgame` repository should have a root `davehub.json` in its **first commit**, with `{"schemaVersion":1,"enabled":false}`. This applies to public and private repositories. The marker contains no private metadata. DaveHub discovery remains an explicit later opt-in.

## Preferred repository creation path

On a machine with Node.js, Git, an authorised Git commit identity and GitHub CLI (`gh auth login` as `tametheboardgame`), run from a DaveHub checkout:

```sh
node scripts/davehub-new-repo.cjs my-new-project
node scripts/davehub-new-repo.cjs my-public-project --public --description "An example project"
```

- **Defaults to private**, unless `--public` is explicitly provided.
- Creates a temporary local Git repository and commits a README and the disabled marker **before** creating the remote.
- Uses `gh repo create --source ... --push` to create the remote with those files in its initial commit.
- Refuses to operate when `gh` is authenticated as an account other than `tametheboardgame`.
- The script does not publish any creative material, write to DaveHub's catalogue or install GitHub Actions.
- If remote creation/push fails, it reports the temporary directory for recovery; it does not delete a partially created GitHub repository or claim success.

If a repository was created directly in GitHub, by another assistant, or through another tool, add the missing marker without touching any existing one:

```sh
node scripts/davehub-new-repo.cjs --repair my-existing-project
```

This uses GitHub's Contents API to **create only if absent**. A marker already present, whether `enabled:false` or `enabled:true`, is never overwritten. Repair requires an existing default branch and GitHub Contents write permission.

## Compliance audit and limits

DaveHub's existing Monday morning GitHub Action runs the read-only discovery scanner. DH-10D extends the report to include GitHub's `created_at` for repositories with absent markers, and fails its audit step when any **public, non-forked, non-archived** repository created on or after `2026-10-28T13:08:00Z` lacks `davehub.json`. The report and annotations show which repository requires repair.

Existing repositories created before the policy date are grandfathered; missing markers on those still mean disabled. No existing repository will be bulk-modified.

**Important limitation:** GitHub personal accounts have no universal account setting that inserts a file into every future repository. The bootstrap script guarantees the default only for repositories created **through that script**. The weekly Action detects public repositories created by other methods, but it has read-only, public-repository permissions and cannot inspect private repositories or fix any repository automatically. Therefore, it does **not** guarantee default files on private repositories created outside the bootstrap script. A GitHub App with an installation covering new repositories and tightly scoped Contents write permission would be required for account-wide repair automation, with additional credential and security review. Do not add a broad cross-repository PAT to a public DaveHub workflow.

If creating repositories through GitHub's web interface, an actual template repository containing `davehub.json` is an alternative, but its template must be explicitly selected on creation. The current DaveHub repository is **not** an appropriate template because it contains the entire website.

## Verification

The CI tests cover parser validation and malicious names, authenticated owner guard, default-private behaviour, opt-out marker in the first commit, no-overwrite repair calls, the new-repository cutoff and discovery timestamp propagation. DaveHub's full site build runs these tests with its existing content/navigation regressions.
