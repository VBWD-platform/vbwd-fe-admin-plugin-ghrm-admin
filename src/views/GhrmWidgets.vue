<template>
  <div class="ghrm-widgets">
    <h1 class="ghrm-widgets__title">
      {{ $t('ghrm.widgets.title') }}
    </h1>

    <div
      v-if="loading"
      class="ghrm-widgets__loading"
    >
      {{ $t('ghrm.widgets.loading') }}
    </div>

    <div
      v-else-if="loadError"
      class="ghrm-widgets__error"
      data-testid="load-error"
    >
      {{ loadError }}
    </div>

    <template v-else>
      <div
        v-for="widget in widgets"
        :key="widget.id"
        class="ghrm-widgets__card"
        :data-testid="`widget-card-${widget.id}`"
      >
        <div class="ghrm-widgets__card-header">
          <h2 class="ghrm-widgets__card-title">
            {{ $t('ghrm.widgets.' + widget.id + 'Label') }}
          </h2>
          <p class="ghrm-widgets__card-desc">
            {{ $t('ghrm.widgets.' + widget.id + 'Desc') }}
          </p>
        </div>

        <GhrmBreadcrumbWidgetConfig
          :widget-id="widget.id"
          :initial-config="widget"
          @saved="onSaved(widget.id, $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ghrmWidgetApi, type GhrmBreadcrumbConfig } from '../api/ghrmWidgetApi';
import GhrmBreadcrumbWidgetConfig from '../components/GhrmBreadcrumbWidgetConfig.vue';

const loading = ref(true);
const loadError = ref('');
const widgets = ref<GhrmBreadcrumbConfig[]>([]);

function onSaved(id: string, updated: GhrmBreadcrumbConfig) {
  const idx = widgets.value.findIndex((w) => w.id === id);
  if (idx !== -1) widgets.value[idx] = updated;
}

onMounted(async () => {
  try {
    const data = await ghrmWidgetApi.getWidgets();
    widgets.value = data.widgets;
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Failed to load widget configs';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.ghrm-widgets { max-width: 860px; margin: 0 auto; padding: 32px 20px; }
.ghrm-widgets__title { font-size: 1.5rem; color: #2c3e50; margin: 0 0 28px; }
.ghrm-widgets__loading,
.ghrm-widgets__error { padding: 40px 0; text-align: center; color: #6b7280; }
.ghrm-widgets__error { color: #dc2626; }
.ghrm-widgets__card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 28px;
}
.ghrm-widgets__card-header { margin-bottom: 20px; }
.ghrm-widgets__card-title { font-size: 1.1rem; color: #2c3e50; margin: 0 0 4px; }
.ghrm-widgets__card-desc { font-size: 13px; color: #6b7280; margin: 0; }
</style>
