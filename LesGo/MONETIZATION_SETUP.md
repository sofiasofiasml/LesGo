# Monetizacion: RevenueCat + Anuncios (AdMob)

## 1) Productos a crear
Crea estos productos en Google Play Console y App Store Connect:

- `lesgo_pro_minigames` (no consumible)
- `lesgo_pro_questions` (no consumible)
- `lesgo_remove_ads` (no consumible)

En RevenueCat, conecta los stores y crea 3 entitlements:

- `pro_minigames`
- `pro_questions`
- `remove_ads`

Asocia cada producto al entitlement correcto.

## 2) Configuracion en app.json
Completa en `expo.extra.revenuecat`:

- `androidApiKey`
- `iosApiKey`
- `entitlements.*`
- `products.*`

Completa en `expo.extra.ads`:

- `androidAppId`
- `iosAppId`
- `androidBannerId`
- `iosBannerId`
- `androidInterstitialId`
- `iosInterstitialId`
- `androidRewardedId`
- `iosRewardedId`

## 3) Que hace la app ahora
- Si compras minijuegos: desbloquea minijuegos premium y el modo Solo Minijuegos.
- Si compras preguntas: desbloquea mas preguntas.
- Si compras quitar anuncios: deja de renderizar banners.
- Incluye boton de restaurar compras.

## 4) Para cobrar dinero real
- Google Play paga a tu cuenta de pagos (tras comision y retenciones segun pais).
- Apple App Store igual en iOS.
- Debes configurar perfil de pagos, impuestos y cuenta bancaria en cada store.

## 5) Importante para pruebas
- En Android/iOS necesitas build de desarrollo o release. Expo Go no sirve para compras nativas ni ads nativos.
- Usa testers internos en Play Console/TestFlight para validar compras y restauracion.

## 6) Siguiente mejora recomendada
La base ya esta implementada:

- Interstitial cada 4 turnos.
- Rewarded para saltar castigo desde el modal de bebida.

Puedes ajustar la frecuencia en `INTERSTITIAL_FREQUENCY` dentro de `app/(tabs)/game.tsx`.
