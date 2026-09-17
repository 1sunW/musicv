###### 8/29/26 - it's broken again! fix coming soon
###### 8/17/26 - i fixed everything!

# x8rr/music
a simple music implementation in fastify

## sources that work
- soundcloud
- youtube

## dead sources but still included for some reason
- tidal (used for searching)
- deezer
- qobuz
- octave

## setup
umm ask claude because there's no docs right now, i'll write some later, but for now just ask claude to implement it for you. there are some instructions in the soundcloud folder !

## Deploying on Render

This repository includes `render.yaml` for a single Render web service. It
builds the TypeScript app, downloads the `yt-dlp` binary used by YouTube and
the SoundCloud fallback, and starts both the Fastify app and the local
SoundCloud backend together.

If creating the service manually instead of using the Blueprint, use:

```sh
npm install
curl -L --fail --silent --show-error \
  -o services/soundcloud-backend/yt-dlp \
  https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp
chmod +x services/soundcloud-backend/yt-dlp
npm run build
```

Start command:

```sh
node render-start.mjs
```
