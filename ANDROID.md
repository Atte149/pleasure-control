# 📱 Android — сборка и установка

Приложение упаковано в нативный Android-проект через **Capacitor 6**.
Готовый файл: **`builds/PleasureControl-debug.apk`** (~3.8 MB).

---

## Установка готового APK

1. Перекинь `builds/PleasureControl-debug.apk` на телефон (USB / облако / `adb install`).
2. На телефоне разреши установку из неизвестных источников.
3. Установи и запусти **Pleasure Control**.

Через adb:
```bash
~/android-sdk/platform-tools/adb install -r builds/PleasureControl-debug.apk
```

---

## ⚠️ Подключение к игрушкам с телефона (важно)

Приложение управляет устройствами через **Intiface Central** по WebSocket.
В вебе адрес определялся автоматически, но на телефоне `localhost` — это сам
телефон, а не компьютер. Поэтому:

**Вариант A — Intiface на ПК, телефон в той же Wi-Fi сети (типично):**
1. Запусти Intiface Central на ПК, включи сервер (порт 12345).
2. В Intiface разреши подключения по сети (bind 0.0.0.0, не только localhost).
3. Узнай IP компьютера (например `192.168.1.119`).
4. В приложении на вкладке **Devices** в поле **Intiface Server Address**
   впиши `ws://192.168.1.119:12345` и нажми Connect.

Адрес сохраняется локально (localStorage), вводить нужно один раз.

**Вариант B — BLE напрямую с телефона:** требует Intiface/Bluetooth-стека на
самом телефоне и выходит за рамки текущей сборки (web-bluetooth в WebView
ограничен). Рекомендуется Вариант A.

---

## Пересборка APK

Требуется: JDK 17 (есть), Android SDK в `~/android-sdk`.

Одной командой:
```bash
cd app
ANDROID_HOME=~/android-sdk npm run android:apk
```
Результат: `app/android/app/build/outputs/apk/debug/app-debug.apk`

Вручную (по шагам):
```bash
cd app
npm run build                 # собрать веб в dist/
npx cap sync android          # скопировать в android-проект
cd android
echo "sdk.dir=$HOME/android-sdk" > local.properties
ANDROID_HOME=~/android-sdk ./gradlew assembleDebug
```

---

## Release-сборка (подписанный APK для распространения)

Debug APK подписан отладочным ключом — для себя ставится без проблем.
Для release нужен свой keystore:
```bash
keytool -genkey -v -keystore my.keystore -alias pleasure \
  -keyalg RSA -keysize 2048 -validity 10000
cd android
ANDROID_HOME=~/android-sdk ./gradlew assembleRelease
# затем zipalign + apksigner из ~/android-sdk/build-tools/35.0.0/
```

---

## Конфигурация Capacitor

- `app/capacitor.config.ts` — appId `com.pleasurecontrol.app`, cleartext включён.
- `app/android/app/src/main/AndroidManifest.xml` — `usesCleartextTraffic=true`,
  `INTERNET` permission (нужно для ws:// к Intiface).
- vite `base: './'` — относительные пути, обязательны для WebView.

---

## Открыть проект в Android Studio

```bash
cd app && npx cap open android
```
