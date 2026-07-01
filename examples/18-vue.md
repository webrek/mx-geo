# Vue (@webrek/mx-geo/vue)

El componente `<MapaMexico>` para Vue 3. Mismo choropleth que el de React para lo
esencial: `data`/`categorias`, paletas, etiquetas y evento `select`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { MapaMexico } from "@webrek/mx-geo/vue";
import { porCapita } from "@webrek/mx-geo";

const ventas = { "09": 1200, "15": 1500, "14": 980, "19": 760 };
const seleccion = ref<string | null>(null);
</script>

<template>
  <MapaMexico :data="ventas" paleta="walmart" etiquetas @select="(e) => (seleccion = e.nombre)" />
  <p v-if="seleccion">Seleccionaste: {{ seleccion }}</p>
</template>
```

El resto del paquete es framework-free y se usa igual desde Vue:

```ts
import { estado, normalizaEstado, porCapita, vecinos } from "@webrek/mx-geo";
import { mapaSVG } from "@webrek/mx-geo/svg";
import { buscaCP } from "@webrek/mx-cp";
```

> El adaptador Vue cubre el choropleth de estados. Para burbujas, mosaico, zoom,
> tooltip a la medida, municipios y export usa por ahora el paquete de React
> (`@webrek/mx-geo/react`) o el render en servidor (`/svg`).
