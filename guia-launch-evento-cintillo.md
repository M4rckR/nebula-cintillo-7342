# Guía: evento de Analytics para el Auto-Target del cintillo

Objetivo: que cada clic en el cintillo del experimento (control y pilotos) envíe a Analytics un **evento propio** (`eventNNN`), para elegirlo en Target como **métrica objetivo** de la actividad Auto-Target (A4T).

No se toca nada existente de viabcp. Todo es nuevo.

---

## Dónde se hace cada cosa

| Paso | Dónde | Qué |
|---|---|---|
| 0 | **Adobe Analytics** (Admin) | Habilitar el evento (y opcionalmente una eVar) en el report suite |
| 1 | **Launch** → Data Elements | Crear el data element `Data Cintillo AT` |
| 2 | **Launch** → Rules | Crear la regla `[CARDS] TC Auto-Target - Clic Cintillo` |
| 3 | **Launch** → Publishing Flow | Publicar (dev → staging → prod) |
| 4 | **viabcp.com** (consola) | Probar |
| 5 | **Adobe Target** | Elegir el evento como Goal Metric |

> **¿Por qué un "data element"?** Sí, es en Launch. En la propiedad *ViaBCP (WebSDK)*, Analytics no se manda con `s.events = ...` como antes: se arma un **objeto de datos** y se envía con la acción *Send event* de Web SDK. Ese objeto se guarda en un data element de tipo **Variable**, que funciona como una "cajita" donde la regla mete los valores (evento, eVar, linkName) antes de enviarlos.
>
> El sitio ya tiene su propia cajita (`Adobe Analytics Data Object`), que usan todas las reglas de viabcp. Creamos **una nueva solo para el experimento** para no mezclar nada con la del sitio.

---

## Paso 0 — Habilitar el evento en Analytics

Ruta en la interfaz actual de Analytics (en el menú **Admin** no aparece "Report Suites" directo):

1. **Admin** → **All admin**. Se abre la página de administración con todas las opciones.
2. Ahí entra a **Report suites**.
3. Se abre **Report Suite Manager**. Haz clic en la fila de **`bancodecreditopublica` — Via BCP (Production)** para seleccionarla; debe quedar resaltada. Es el report suite de viabcp.com, **no** CIAM (CIAM es el login / Banca por Internet).
4. **Edit Settings** (arriba de la lista) → **Conversion** → **Success Events**. Busca un evento libre y ponle nombre.
5. Si quieres probar antes de producción, repite lo mismo en **Via BCP (Development)** (`bancodecreditopublicadev`), con el **mismo número** de evento.

> Si en *All admin* no ves **Report suites**, o al entrar no aparece **Edit Settings**, tu usuario no tiene permisos de Admin en Analytics. En ese caso pide solo este paso a quien los tenga.

1. Busca un evento **sin nombre o deshabilitado**. En viabcp ya se usan los eventos 16, 17, 18, 21, 22, 151, 152, 166 y 301, así que no uses esos. Confírmalo en la lista porque el report suite puede tener otros sitios.
2. Nombre: `Clic Cintillo Auto-Target`. Type: **Counter**.
3. Guarda. Anota el número, por ejemplo `event45`. En esta guía lo llamamos **`eventNNN`**.

*(Opcional)* En **Conversion Variables** habilita una eVar libre (en viabcp ya se usan 1, 2, 4, 6, 15–18, 21, 22, 24, 25, 31, 47, 48 y 51). Nombre: `Experiencia Cintillo AT`; Expire: **Hit**. Así tendrás el texto de la experiencia (`TC Auto-Target - P1 - ...`) en su propia dimensión. En esta guía se llama **`eVarNN`**.

---

## Paso 1 — Data element `Data Cintillo AT`

Launch → propiedad **ViaBCP (WebSDK)** → **Data Elements** → **Add Data Element**.

| Campo | Valor |
|---|---|
| Name | `Data Cintillo AT` |
| Extension | **Adobe Experience Platform Web SDK** |
| Data Element Type | **Variable** |
| Properties | Elige **Data** (no XDM) y marca la solución **Adobe Analytics** |

Guarda. No lleva ningún valor todavía: lo llena la regla del paso 2.

---

## Paso 2 — Regla `[CARDS] TC Auto-Target - Clic Cintillo`

Launch → **Rules** → **Add Rule** → Name: `[CARDS] TC Auto-Target - Clic Cintillo`.

### 2.1 Event (cuándo se dispara)

**Events → Add**

| Campo | Valor |
|---|---|
| Extension | La del data layer que ya usa el sitio (**Adobe Client Data Layer** de gcoe) |
| Event Type | **Data Pushed** |
| Listen to | **Specific Event** → `trackAction` |
| Order | 50 (por defecto) |

Es el mismo disparador que usa el sitio para todos los clics. Lo filtramos en las condiciones.

### 2.2 Conditions (filtro: solo clics del experimento)

**Conditions → Add**, tres condiciones (todas tienen que cumplirse):

1. **Core → Cookie**
   - Cookie name: `politica_privacidad_marketing_analitica`
   - Value: `true`
   - *(Es la misma condición que usa el sitio: solo se mide a quien aceptó cookies de analítica.)*
2. **Core → Value Comparison**
   - Left operand: `%Action Name%`
   - Operator: **Equals**
   - Right operand: `Cintillo`
3. **Core → Value Comparison**
   - Left operand: `%Action Label%`
   - Operator: **Starts With**
   - Right operand: `TC Auto-Target`

> `%Action Name%` y `%Action Label%` ya existen en la propiedad: leen `action.name` y `action.label` del `digitalData`.
>
> Con esto la regla se dispara con los clics de control y de P1–P5, pero **no** con el cierre (`Cintillo - Cerrar`) ni con ningún otro clic del sitio.

### 2.3 Actions (qué envía)

**Acción A — llenar la cajita**

**Actions → Add**

| Campo | Valor |
|---|---|
| Extension | **Adobe Experience Platform Web SDK** |
| Action Type | **Update variable** |
| Data element | `Data Cintillo AT` |

En el árbol, abre **Adobe Analytics** y marca **Clear existing value** en el objeto, para que no arrastre datos de un clic anterior. Luego llena estos campos:

| Campo | Valor |
|---|---|
| Events | `eventNNN` (el del paso 0) |
| eVarNN *(opcional)* | `%Action Label%` |
| prop1 | `ViaBCP` |
| Link Name | `TC Auto-Target - Cintillo` |
| Link Type | `o` (Other / custom link) |

**Acción B — enviar**

**Actions → Add**

| Campo | Valor |
|---|---|
| Extension | **Adobe Experience Platform Web SDK** |
| Action Type | **Send event** |
| Instance | `alloy` |
| Type | `web.webinteraction.linkClicks` |
| XDM | *(vacío)* |
| Data | `%Data Cintillo AT%` |

El resto se deja por defecto. No actives *Render decisions* ni scopes de personalización.

**Guarda la regla.**

---

## Paso 3 — Publicar

Launch → **Publishing Flow**

1. En tu library de **Development** → **Add All Changed Resources** (deben aparecer el data element y la regla) → **Save & Build**.
2. Submit → **Build for Staging** → prueba (paso 4) → **Approve** → **Build & Publish to Production**.

---

## Paso 4 — Probar en viabcp.com

1. Abre https://www.viabcp.com/ y acepta las cookies.
2. Consola (⌘⌥J): ejecuta `_satellite.setDebug(true)`.
3. Pega el contenido de `variantes/piloto1.html` sin las etiquetas `<script>`, o el de `control.html`.
4. Haz clic en el cintillo. Para no salir de la página, usa clic con ⌘ y se abre en otra pestaña.

**Qué debes ver:**

- En consola: `Rule "[CARDS] TC Auto-Target - Clic Cintillo" fired.`
- En Tagbird o en AEP Debugger, **dos** requests seguidos:

| # | Origen | linkName | Clave |
|---|---|---|---|
| 1 | Regla del sitio | `Action` | `eVar15: Header:Personalizado:Cintillo:TC Auto-Target - P1 - Oferta preaprobada` |
| 2 | **Tu regla** | `TC Auto-Target - Cintillo` | **`events: eventNNN`** |

- Al cerrar con la **X**: aparece el request 1 con `Cintillo - Cerrar`, pero **no** aparece el 2.
- En el cintillo normal del sitio, sin snippet: **no** aparece el 2.

> Ignora los requests `Promotion View` con `event21`: son las impresiones del carrusel del home.

---

## Paso 5 — Elegir la métrica en Target

Unas horas después de publicar, en la actividad Auto-Target → **Goals & Settings**:

| Campo | Valor |
|---|---|
| Reporting Source | **Adobe Analytics** |
| Report Suite | **Via BCP (Production)**, el del paso 0. No uses CIAM (Production), que es el que viene por defecto |
| What do you want to measure | **Use an Analytics metric** |
| Metric | **Clic Cintillo Auto-Target** |
| How would you like to optimize | **Maximize Visit Conversion Rate** |

> Si el evento no aparece en la lista, revisa que esté habilitado en el **mismo** report suite que elegiste en Target.

---

## Resumen del flujo

```
Usuario hace clic en el cintillo (control o P1–P5)
  └─ snippet: digitalData.push({ action:{ name:'Cintillo', label:'TC Auto-Target - …' }, event:'trackAction' })
       ├─ Regla del sitio "Action - DO & XDM"           → hit Analytics con eVar15 (como siempre)
       └─ TU regla "[CARDS] TC Auto-Target - Clic…"     → hit Analytics con eventNNN
                                                            └─ Target (A4T) lo usa como conversión
```
