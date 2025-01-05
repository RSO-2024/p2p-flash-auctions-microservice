# Mikrostoritev: P2P Flash auctions

## Struktura

Vsa izvorna koda mikrostoritve se nahaja v `src` mapi:

- `config` - Implementacija za dinamično konfiguracijo aplikacije
- `middleware` - Funkcije za preverjanje avtorizacije
- `models` - Podatkovni modeli
- `sentry` - Implementacija za `sentry.io`
- `supabase` - Implementacija za dostop do podatkovne baze
- `utils` - Pomožne funkcije
- `routes` - Končne točke, ki so razporejene v posamezne podmape
- `server.ts` - Glavna datoteka za zagon aplikacije

## Lokalna nastavitev

Razvojno okolje:

`npm run dev`

Produkcijsko okolje

`npm run build`

`npm run start`

Okoljske spremenljivke se nahajajo v datoteki `.env`.

## Nastavitev v oblak

Za nastavitev mikrostoritvene aplikacije v oblak je potrebno storiti sledeče:

1. Docker build z uporabo datoteke `docker-compose.yml`

`docker-compose build`

2. Docker push na privaten DigitalOcean (`clutchbids-registry`) repositorij:

Pri tem je potrebno imeti račun na DigitalOcean in opraviti docker prijavo:

```
# docker login registry.digitalocean.com
Username: <registered-email>
Password: <paste-api-token>
```

Po opravljeni prijavi lahko pushamo:

`docker-compose push`

Za nastavitev v Kubernetes gručo se [sledi ostalim navodilom tukaj](https://github.com/RSO-2024/clutchbids-k8s/blob/main/README.md).

### Nastavitev skrivnosti na Kubernetes gruči

Za nastavitev skrivnih konfiguracij in okoljskih spremenljivk je potrebno ustvariti `Secrets` za posamezno mikrostoritev:

Ustvarjanje skrivnosti iz `.env` datoteke:

`kubectl --kubeconfig=k8s-clutchbids-kubeconfig.yaml create secret generic [secret_name] --from-env-file=.env`

### Nastavitev dinamične konfiguracije na Kubernetes gruči

Za spremembo in nastavitev dinamične konfiguracije je potrebno ustvariti `ConfigMap` na Kubernetes gruči.

Sprememba konfiguracije dinamično:
1. Sprememba na Kubernetes gruči: `kubectl --kubeconfig=k8s-clutchbids-kubeconfig.yaml edit configmap [config_name]`
2. Za osvežitev konfiguracije je potrebno še poklicati končno točko: `/api/config/reload`

### Zdravje mikrostoritve

Za zdravje mikrostoritve so na voljo naslednje končne točke:
- `/api/health` - Preveri zdravje celotne mikrostoritve
- `/api/liveness` - Preveri, če je mikrostoritev še na voljo
- `/api/readiness` - Preveri, če je mikrostoritev na voljo za operacijo

### Monitoring napak mikrostoritve

Za spremnljanje napak mikrostoritve je nastavljen [sentry.io](https://sentry.io/welcome/), ki javlja morebitne napake v določenih delih mikrostoritve v produkcijskem okolju. Na nadzorni plošči je možen ogled vseh napak.

## Dokumentacija API

Dokumentacija za posamezno mikrostoritev je dostopna na končni točki: `/api/docs`.

