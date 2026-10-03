
<template>
  <div class="q-pa-md q-pa-lg-md wrapper">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          Identidade visual
        </div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          Personalize a marca da sua loja.
        </div>
      </div>

      <q-btn
        flat
        no-caps
        icon="mdi-arrow-left"
        label="Voltar"
        @click="router.back()"
      />
    </div>

    <q-inner-loading :showing="loadingTheme">
      <q-spinner size="42px" color="primary" />
    </q-inner-loading>

    <div v-if="!loadingTheme" class="row q-col-gutter-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Logo da loja</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Envie a logo para identificar sua loja e gerar uma sugestão
              de cores automaticamente.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div
              class="column items-center justify-center bg-grey-2 rounded-borders q-pa-md"
              style="min-height: 210px;"
            >
              <q-img
                v-if="themeForm.logoUrl"
                :src="themeForm.logoUrl"
                fit="contain"
                style="width: 100%; height: 180px;"
              />
              <div v-else class="column items-center text-grey-6">
                <q-icon name="mdi-image-outline" size="56px" />
                <div class="text-body2 q-mt-sm">
                  Nenhuma logo cadastrada
                </div>
              </div>
            </div>

            <q-file
              v-model="logoFile"
              class="q-mt-md"
              outlined
              clearable
              accept=".jpg,.jpeg,.png,.webp"
              max-file-size="5242880"
              label="Selecionar logo"
              :disable="uploading || saving"
              @update:model-value="handleLogoSelected"
              @rejected="handleFileRejected"
            >
              <template #prepend>
                <q-icon name="mdi-cloud-upload-outline" />
              </template>
            </q-file>

            <div class="text-caption text-grey-6 q-mt-sm">
              JPG, JPEG, PNG ou WEBP. Máximo de 5 MB.
            </div>

            <q-banner
              v-if="uploading"
              rounded
              class="bg-blue-1 text-blue-10 q-mt-md"
            >
              <template #avatar>
                <q-spinner color="primary" />
              </template>
              Enviando e analisando sua logo...
            </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-h6">Cores da marca</div>
              <div class="text-body2 text-grey-7 q-mt-xs">
                Escolha uma sugestão ou personalize as três cores.
              </div>
            </div>

            <q-chip
              v-if="suggestion"
              color="primary"
              text-color="white"
              icon="mdi-auto-fix"
            >
              Sugestão automática
            </q-chip>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="suggestion">
            <div class="text-subtitle1 text-weight-medium">
              Sugestão gerada pela logo
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div
                v-for="color in suggestionColors"
                :key="color.key"
                class="col-12 col-sm-4"
              >
                <q-card flat bordered>
                  <div
                    class="color-swatch"
                    :style="{ backgroundColor: color.value }"
                  />
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-7">
                      {{ color.label }}
                    </div>
                    <div class="text-body2 text-weight-medium">
                      {{ color.value }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div v-if="detectedColors.length" class="q-mt-md">
              <div class="text-subtitle2">Cores identificadas</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <div
                  v-for="color in detectedColors"
                  :key="`${color.hex}-${color.percentage}`"
                  class="col-auto"
                >
                  <q-chip square>
                    <q-avatar
                      :style="{ backgroundColor: color.hex }"
                      text-color="white"
                    />
                    {{ color.hex }}
                    <span v-if="color.percentage != null" class="q-ml-xs">
                      {{ color.percentage.toFixed(1) }}%
                    </span>
                  </q-chip>
                </div>
              </div>
            </div>

            <q-btn
              class="q-mt-md"
              color="primary"
              unelevated
              no-caps
              icon="mdi-check"
              label="Aplicar sugestão"
              :loading="saving"
              @click="applySuggestion"
            />
          </q-card-section>

          <q-separator v-if="suggestion" />

          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">
                  {{ customizing ? 'Personalizar cores' : 'Identidade atual' }}
                </div>
                <div class="text-body2 text-grey-7">
                  {{ customizing
                    ? 'As alterações serão aplicadas após salvar.'
                    : 'Estas são as cores utilizadas no perfil público.' }}
                </div>
              </div>

              <q-btn
                v-if="!customizing"
                flat
                no-caps
                color="primary"
                icon="mdi-pencil-outline"
                label="Editar"
                @click="startCustomization"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div
                v-for="color in editableColors"
                :key="color.key"
                class="col-12 col-sm-4"
              >
                <div class="text-caption text-grey-7 q-mb-xs">
                  {{ color.label }}
                </div>

                <q-input
                  v-model="themeForm[color.key]"
                  outlined
                  dense
                  :readonly="!customizing"
                  :disable="!customizing"
                  :rules="[
                    value => isValidHex(value) || 'Informe uma cor hexadecimal válida.',
                  ]"
                >
                  <template #prepend>
                    <q-icon
                      name="mdi-circle"
                      :style="{ color: themeForm[color.key] }"
                    />
                  </template>

                  <template v-if="customizing" #append>
                    <q-icon
                      name="mdi-palette-outline"
                      class="cursor-pointer"
                    >
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color
                          v-model="themeForm[color.key]"
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div v-if="customizing" class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn
                flat
                no-caps
                label="Cancelar"
                :disable="saving"
                @click="cancelCustomization"
              />
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="mdi-content-save-outline"
                label="Salvar identidade"
                :loading="saving"
                @click="saveCustomTheme"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-lg">
          <q-card-section>
            <div class="text-h6">Pré-visualização</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Veja como as cores e a logo serão aplicadas no perfil público.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="preview-frame" :style="previewStyle">
              <div class="row items-center justify-between q-pa-md preview-header">
                <div class="row items-center q-gutter-sm">
                  <q-img
                    v-if="themeForm.logoUrl"
                    :src="themeForm.logoUrl"
                    fit="contain"
                    style="width: 80%; height: 68px;"
                  />
                  <div class="text-weight-bold">
                    Sua loja
                  </div>
                </div>
                <div class="row items-center q-gutter-md gt-xs">
                  <span>Início</span>
                  <span>Serviços</span>
                  <span>Profissionais</span>
                </div>
                <q-btn
                  class="lt-sm"
                  flat
                  round
                  icon="mdi-menu"
                  aria-label="Menu"
                />
              </div>

              <div class="q-pa-lg preview-content">
                <div class="text-overline">SEJA BEM-VINDO</div>
                <div class="text-h4 text-weight-bold q-mt-xs">
                  Agende seu horário
                </div>
                <div class="text-body1 q-mt-sm">
                  Escolha um serviço e encontre o melhor horário para você.
                </div>

                <div class="row q-gutter-sm q-mt-lg">
                  <q-btn
                    unelevated
                    no-caps
                    label="Agendar"
                    class="preview-primary"
                  />
                  <q-btn
                    outline
                    no-caps
                    label="Conhecer serviços"
                    class="preview-secondary"
                  />
                </div>

                <q-card flat bordered class="q-mt-lg preview-service">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">
                      Atendimento personalizado
                    </div>
                    <div class="text-body2 q-mt-xs">
                      Uma experiência pensada para você.
                    </div>
                    <q-chip
                      class="q-mt-sm"
                      color="positive"
                      text-color="white"
                      icon="mdi-check-circle-outline"
                    >
                      Exemplo de status do sistema
                    </q-chip>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  AnalyzePaletteResponse,
  StoreBrandTheme,
  StoreTheme,
} from '~/composables/useStoreTheme'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const storeId = computed(() => String(route.params.id))

const { upload } = useCloudinaryUpload()

const {
  loading: themeLoading,
  getTheme,
  analyzePalette,
  saveTheme,
} = useStoreTheme()

const loadingTheme = computed(() => themeLoading.value)

const logoFile = ref<File | null>(null)
const uploading = ref(false)
const saving = ref(false)
const customizing = ref(false)

const currentTheme = ref<StoreTheme | null>(null)
const suggestion = ref<AnalyzePaletteResponse | null>(null)
const editSnapshot = ref<StoreBrandTheme | null>(null)

const defaults: StoreBrandTheme = {
  logoUrl: null,
  primaryColor: '#642AFB',
  secondaryColor: '#FFC107',
  accentColor: '#FF4081',
}

const themeForm = reactive<StoreBrandTheme>({
  ...defaults,
})

const editableColors = [
  { key: 'primaryColor', label: 'Cor principal' },
  { key: 'secondaryColor', label: 'Cor secundária' },
  { key: 'accentColor', label: 'Cor de destaque' },
] as const

const suggestionColors = computed(() => {
  if (!suggestion.value) return []

  return [
    {
      key: 'primaryColor',
      label: 'Principal',
      value: suggestion.value.primaryColor,
    },
    {
      key: 'secondaryColor',
      label: 'Secundária',
      value: suggestion.value.secondaryColor,
    },
    {
      key: 'accentColor',
      label: 'Destaque',
      value: suggestion.value.accentColor,
    },
  ]
})

const detectedColors = computed(
  () => suggestion.value?.detectedColors ?? [],
)

const previewStyle = computed(() => ({
  '--brand-primary': themeForm.primaryColor,
  '--brand-secondary': themeForm.secondaryColor,
  '--brand-accent': themeForm.accentColor,
}))

const loadTheme = async () => {
  try {
    const theme = await getTheme(storeId.value)

    if (!theme) {
      customizing.value = true
      return
    }

    currentTheme.value = theme

    Object.assign(themeForm, {
      logoUrl: theme.logoUrl ?? null,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível carregar a identidade visual.',
      ),
    })
  }
}

const startCustomization = () => {
  editSnapshot.value = { ...themeForm }
  customizing.value = true
}

const handleLogoSelected = async (file: File | null) => {
  if (!file) return

  if (!customizing.value) {
    startCustomization()
  }

  uploading.value = true

  try {
    const result = await upload(file, 'store')

    themeForm.logoUrl = result.secureUrl

    const analysis = await analyzePalette(
      storeId.value,
      result.colors,
    )

    suggestion.value = analysis

    $q.notify({
      type: 'positive',
      message: 'Logo analisada. Confira a sugestão de cores.',
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível processar a logo.',
      ),
    })
  } finally {
    uploading.value = false
  }
}

const applySuggestion = async () => {
  if (!suggestion.value) return

  Object.assign(themeForm, {
    primaryColor: suggestion.value.primaryColor,
    secondaryColor: suggestion.value.secondaryColor,
    accentColor: suggestion.value.accentColor,
  })

  await saveCustomTheme()
}

const saveCustomTheme = async () => {
  if (!validateThemeForm()) return

  saving.value = true

  try {
    const payload: StoreBrandTheme = {
      logoUrl: themeForm.logoUrl,
      primaryColor: themeForm.primaryColor,
      secondaryColor: themeForm.secondaryColor,
      accentColor: themeForm.accentColor,
    }

    const theme = await saveTheme(
      storeId.value,
      payload,
    )

    currentTheme.value = theme
    Object.assign(themeForm, {
      logoUrl: theme.logoUrl ?? null,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    })

    customizing.value = false
    editSnapshot.value = null
    suggestion.value = null
    logoFile.value = null

    $q.notify({
      type: 'positive',
      message: 'Identidade visual salva com sucesso.',
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível salvar a identidade visual.',
      ),
    })
  } finally {
    saving.value = false
  }
}

const cancelCustomization = () => {
  if (editSnapshot.value) {
    Object.assign(themeForm, editSnapshot.value)
  } else if (currentTheme.value) {
    Object.assign(themeForm, {
      logoUrl: currentTheme.value.logoUrl ?? null,
      primaryColor: currentTheme.value.primaryColor,
      secondaryColor: currentTheme.value.secondaryColor,
      accentColor: currentTheme.value.accentColor,
    })
  } else {
    Object.assign(themeForm, defaults)
  }

  customizing.value = false
  editSnapshot.value = null
  suggestion.value = null
  logoFile.value = null
}

const validateThemeForm = () => {
  const valid = editableColors.every(
    color => isValidHex(themeForm[color.key]),
  )

  if (!valid) {
    $q.notify({
      type: 'negative',
      message: 'Verifique as cores informadas antes de salvar.',
    })
  }

  return valid
}

const isValidHex = (value: string) => {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

const handleFileRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'Arquivo inválido. Use JPG, JPEG, PNG ou WEBP de até 5 MB.',
  })
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  const value = error as {
    data?: { message?: string }
    response?: { _data?: { message?: string } }
    message?: string
  }

  return (
    value?.data?.message
    ?? value?.response?._data?.message
    ?? value?.message
    ?? fallback
  )
}

onMounted(loadTheme)
</script>

<style scoped>
.color-swatch {
  height: 72px;
}

.preview-frame {
  overflow: hidden;
  border: 1px solid var(--q-separator-color);
  border-radius: 12px;
  background: white;
  color: #241610;
}

.preview-header {
  background: var(--brand-primary);
  color: #241610;
}

.preview-content {
  background: var(--brand-secondary);
}

.preview-primary {
  background: var(--brand-primary);
  color: #241610;
}

.preview-secondary {
  color: #241610;
  border-color: #241610;
}

.preview-service {
  background: white;
  border-color: var(--brand-accent);
}
</style>
