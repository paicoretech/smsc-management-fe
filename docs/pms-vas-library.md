# PMS VAS in the SMSC console

The VAS screens are not part of this repository. They live in `pms-vas-platform-fe` and are consumed
here as `@paicore/pms-vas-ui`, installed from the distribution repository that its Jenkins pipeline
publishes:

```
git+ssh://git@bitbucket.org:paicdb/pms-vas-ui-dist.git#<branch or tag>
```

Pin a tag for anything that gets deployed. A branch reference is for integration work only, because
the same reference returns different content over time.

## What this repository owns

| Concern | Where |
| ------- | ----- |
| Route registration | [`src/app/pages/pms-vas/pms-vas-routing.module.ts`](../src/app/pages/pms-vas/pms-vas-routing.module.ts) |
| Access control | [`src/app/core/guards/pms-vas.guard.ts`](../src/app/core/guards/pms-vas.guard.ts) |
| Library configuration | [`src/app/core/config/pms-vas-ui.config.ts`](../src/app/core/config/pms-vas-ui.config.ts) |
| Menu entries | [`src/app/theme/layout/sidebar/sidebar-items.ts`](../src/app/theme/layout/sidebar/sidebar-items.ts) |

Everything else — components, services, models and styling — comes from the package. Changes to the
VAS screens are made in `pms-vas-platform-fe` and arrive here through a version bump.

## Configuration

| Variable | Meaning |
| -------- | ------- |
| `NG_APP_ENABLE_VAS` | Shows the VAS menu group and allows its routes to load. Defaults to `false`. |
| `NG_APP_PMS_VAS_API_BASE_URL` | Base URL of the PMS VAS backend. |
| `NG_APP_PMS_VAS_INTERNAL_API_KEY` | Key for the internal messaging endpoints. Leave empty unless the deployment needs them. |

## Local development in the SMSC console

With the PMS backend running on the host at port `9088`, start the console with
`docker compose -f docker-compose-dev.yml up -d --build`. The VAS page is at
`http://localhost:4200/pages/pms-vas`; Campaigns is at
`http://localhost:4200/pages/pms-vas/campaigns`. Sign in with a `ROOT`,
`ADMINISTRATOR`, or `PMS_VAS_ACCESS` role.

The console calls `/pms/api/v1`; its development proxy forwards those requests
to `http://host.docker.internal:9088/api/v1`. The same setup works when the PMS
backend runs in Docker and publishes port `9088` on the host. For a different
published port, set the target when starting the console, for example:

```bash
PMS_BACKEND_TARGET=http://host.docker.internal:8081 docker compose -f docker-compose-dev.yml up -d --force-recreate
```

The development container uses this project's local `node_modules` through the
project bind mount. Install dependencies locally before starting it.

The console maps its own roles onto the library's capabilities in `pms-vas-ui.config.ts`: `ROOT` and
`ADMINISTRATOR` can write, and `PMS_VAS_ACCESS` can read. The library asks through `canAccess`, so
every create, edit and delete action hides itself without this repository knowing which ones exist.

## Building

npm always records a `git+ssh://` URL for a Bitbucket dependency, whatever form `package.json` uses,
and `npm ci` installs from that recorded URL. The image build therefore keeps the SSH reference and
lets git rewrite it to authenticated HTTPS, which is how every other pipeline here reaches Bitbucket:

```dockerfile
git config --global credential.helper '!f() { cat /run/secrets/bitbucket_credentials; }; f'
git config --global url."https://bitbucket.org/".insteadOf "ssh://git@bitbucket.org/"
```

The credentials arrive as a BuildKit secret, so they never reach an image layer, and the pipeline
feeds it from `Devops` — the credential Jenkins already uses to clone this repository over HTTPS.

Bitbucket expects a different account name depending on the kind of credential: an Atlassian API
token authenticates as the literal `x-bitbucket-api-token-auth`, while an app password authenticates
as the account name. The Jenkins git plugin substitutes this on its own, which is why cloning works
there while a hand-built basic-auth request with the stored account name is rejected for every
repository. The pipeline probes both forms and uses whichever one authenticates, so rotating to a
different kind of credential needs no change here. The
secret holds git's credential-helper format rather than a URL, because the account name is an email
address and git cannot parse the second `@` in `https://user@domain:password@bitbucket.org`:

```bash
printf 'username=%s\npassword=%s\n' '<user>' '<app-password>' > .git-credentials.build
DOCKER_BUILDKIT=1 docker build --secret id=bitbucket_credentials,src=.git-credentials.build -t smsc-management-fe .
rm -f .git-credentials.build
```
