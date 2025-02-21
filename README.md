# Basic Auth Adapter

Deploy as a [Web Runner](https://docs.osaas.io/osaas.wiki/Service%3A-Web-Runner.html) to provide Basic Auth authentication for one of your Eyevinn Open Source Cloud service instances.

## Usage

Specify service id, username and password with the environment variables `SERVICE_ID`, `USERNAME` and `PASSWORD`. See the section "Configuring your application" in the [Web Runner documentation](https://docs.osaas.io/osaas.wiki/Service%3A-Web-Runner.html) for instructions how to provide these environment variables.

Create a Web Runner instance from this GitHub repository or make a fork and adapt it to the way you like.

### Create a Web Runner from this repository

Generate a personal GitHub token that have access to this repository on behalf of your user. We recommend you restrict this token to only access what it needs. Store this GitHub token as a secret in the Web Runner service.

Store your Eyevinn Open Source Cloud personal access token (found in Settings/API in web console) as a secret in the Web Runner service.

Assuming that the GitHub token secret is stored as `ghtoken`, OSC access token as `osctoken` and the name of the configuration service is `authadaptconfig` you can deploy the runner using the OSC command line tool.

```bash
% osc create eyevinn-web-runner myadapter \
  -o GitHubUrl=https://github.com/EyevinnOSC/basic-auth-adapter \
  -o GitHubToken="{{secrets.ghtoken}}" \
  -o OscAccessToken="{{secrets.osctoken}}" \
  -o ConfigService=authadaptconfig
```

As an example we have a basic auth adapter for an [HLS Stream Monitor](https://app.osaas.io/dashboard/service/eyevinn-hls-monitor) instance named `test`.

```bash
% curl -u myuser:changeme https://eyevinnlab-myadapter.eyevinn-web-runner.auto.prod.osaas.io/test/metrics
```
