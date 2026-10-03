<template>
  <div class="store-map-wrapper">
    <div
      ref="mapElement"
      class="store-map"
    />

    <div class="store-map-hint">
      <q-icon
        name="mdi-information-outline"
        size="18px"
      />

      <span>
        Arraste o marcador para ajustar a localização exata da loja.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap, Marker } from 'leaflet'

interface Props {
  latitude?: number | null
  longitude?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  latitude: null,
  longitude: null,
})

const emit = defineEmits<{
  'update:coordinates': [
    coordinates: {
      latitude: number
      longitude: number
    },
  ]
}>()

const mapElement = ref<HTMLElement | null>(null)

let map: LeafletMap | null = null
let marker: Marker | null = null

const defaultCoordinates = {
  latitude: -22.9068,
  longitude: -43.1729,
}

const getCoordinates = () => ({
  latitude: props.latitude ?? defaultCoordinates.latitude,
  longitude: props.longitude ?? defaultCoordinates.longitude,
})

const createMarker = async () => {
  if (!map) {
    return
  }

  const L = await import('leaflet')

  const coordinates = getCoordinates()

  marker?.remove()

  marker = L.marker(
    [coordinates.latitude, coordinates.longitude],
    {
      draggable: true,
    },
  ).addTo(map)

  marker.on('dragend', () => {
    if (!marker) {
      return
    }

    const position = marker.getLatLng()

    emit('update:coordinates', {
      latitude: position.lat,
      longitude: position.lng,
    })
  })
}

const initializeMap = async () => {
  if (!mapElement.value) {
    return
  }

  const L = await import('leaflet')

  map = L.map(mapElement.value).setView(
    [
      defaultCoordinates.latitude,
      defaultCoordinates.longitude,
    ],
    15,
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
  ).addTo(map)

  await createMarker()

  const coordinates = getCoordinates()

  map.setView(
    [coordinates.latitude, coordinates.longitude],
    17,
  )
}

const updateMapPosition = async () => {
  if (!map) {
    return
  }

  const coordinates = getCoordinates()

  map.setView(
    [coordinates.latitude, coordinates.longitude],
    17,
  )

  await createMarker()
}

onMounted(async () => {
  await initializeMap()
})

watch(
  () => [props.latitude, props.longitude],
  async () => {
    await updateMapPosition()
  },
)

onBeforeUnmount(() => {
  marker?.remove()
  map?.remove()

  marker = null
  map = null
})
</script>

<style scoped>
.store-map-wrapper {
  width: 100%;
}

.store-map {
  width: 100%;
  height: 360px;
  overflow: hidden;
  border-radius: 12px;
}

.store-map-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--q-color-grey-7);
  font-size: 13px;
}
</style>