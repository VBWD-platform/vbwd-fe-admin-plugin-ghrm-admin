<template>
  <div class="ghrm-widget-config">
    <!-- Tabs -->
    <div class="ghrm-widget-config__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="ghrm-widget-config__tab"
        :class="{ 'ghrm-widget-config__tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ $t('ghrm.breadcrumbConfig.tab' + tab.id.charAt(0).toUpperCase() + tab.id.slice(1)) }}
      </button>
    </div>

    <!-- General tab -->
    <div
      v-if="activeTab === 'general'"
      class="ghrm-widget-config__panel"
    >
      <div class="ghrm-field">
        <label class="ghrm-label">{{ $t('ghrm.breadcrumbConfig.labelSeparator') }}</label>
        <input
          v-model="draft.separator"
          class="ghrm-input ghrm-input--short"
          type="text"
          maxlength="4"
          data-testid="separator-input"
        >
        <p class="ghrm-hint">
          {{ $t('ghrm.breadcrumbConfig.hintSeparator', { slash: '/', gt: '>', rsaquo: '\u203A' }) }}
        </p>
      </div>

      <div class="ghrm-field">
        <label class="ghrm-label">{{ $t('ghrm.breadcrumbConfig.labelRootLabel') }}</label>
        <input
          v-model="draft.root_name"
          class="ghrm-input"
          type="text"
          data-testid="root-name-input"
        >
        <p class="ghrm-hint">
          {{ $t('ghrm.breadcrumbConfig.hintRootLabel') }}
        </p>
      </div>

      <div class="ghrm-field">
        <label class="ghrm-label">{{ $t('ghrm.breadcrumbConfig.labelRootUrl') }}</label>
        <input
          v-model="draft.root_slug"
          class="ghrm-input"
          type="text"
          data-testid="root-slug-input"
        >
      </div>

      <div class="ghrm-field ghrm-field--checkbox">
        <label class="ghrm-label">
          <input
            v-model="draft.show_category"
            type="checkbox"
            data-testid="show-category-checkbox"
          >
          {{ $t('ghrm.breadcrumbConfig.labelShowCategory') }}
        </label>
        <p class="ghrm-hint">
          {{ $t('ghrm.breadcrumbConfig.hintShowCategory') }}
        </p>
      </div>

      <div class="ghrm-field">
        <label class="ghrm-label">{{ $t('ghrm.breadcrumbConfig.labelMaxLabelLength') }}</label>
        <input
          v-model.number="draft.max_label_length"
          class="ghrm-input ghrm-input--short"
          type="number"
          min="10"
          max="120"
          data-testid="max-label-input"
        >
        <p class="ghrm-hint">
          {{ $t('ghrm.breadcrumbConfig.hintMaxLabelLength') }}
        </p>
      </div>
    </div>

    <!-- CSS tab -->
    <div
      v-else-if="activeTab === 'css'"
      class="ghrm-widget-config__panel"
    >
      <div class="ghrm-field">
        <label class="ghrm-label">{{ $t('ghrm.breadcrumbConfig.labelCustomCss') }}</label>
        <textarea
          v-model="draft.css"
          class="ghrm-textarea"
          rows="12"
          spellcheck="false"
          data-testid="css-textarea"
        />
        <p class="ghrm-hint">
          {{ $t('ghrm.breadcrumbConfig.hintCustomCss') }}
        </p>
      </div>
    </div>

    <!-- Preview tab -->
    <div
      v-else-if="activeTab === 'preview'"
      class="ghrm-widget-config__panel ghrm-widget-config__panel--preview"
    >
      <p class="ghrm-hint ghrm-hint--preview">
        {{ $t('ghrm.breadcrumbConfig.hintPreview') }}
      </p>
      <div class="ghrm-preview-frame">
        <GhrmBreadcrumbPreview
          :config="draft"
          :widget-id="widgetId"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="ghrm-widget-config__actions">
      <button
        class="ghrm-btn ghrm-btn--secondary"
        :disabled="saving"
        data-testid="reset-btn"
        @click="reset"
      >
        {{ $t('ghrm.breadcrumbConfig.reset') }}
      </button>
      <button
        class="ghrm-btn ghrm-btn--primary"
        :disabled="saving"
        data-testid="save-btn"
        @click="save"
      >
        {{ saving ? $t('ghrm.breadcrumbConfig.saving') : $t('ghrm.breadcrumbConfig.save') }}
      </button>
    </div>

    <p
      v-if="saveError"
      class="ghrm-error"
      data-testid="save-error"
    >
      {{ saveError }}
    </p>
    <p
      v-if="saveOk"
      class="ghrm-success"
      data-testid="save-ok"
    >
      {{ $t('ghrm.breadcrumbConfig.saved') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { GhrmBreadcrumbConfig } from '../api/ghrmWidgetApi';
import { ghrmWidgetApi } from '../api/ghrmWidgetApi';
import GhrmBreadcrumbPreview from './GhrmBreadcrumbPreview.vue';

interface Props {
  widgetId: string;
  initialConfig: GhrmBreadcrumbConfig;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'saved', config: GhrmBreadcrumbConfig): void }>();

const tabs: Array<{ id: 'general' | 'css' | 'preview'; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'css', label: 'CSS' },
  { id: 'preview', label: 'Preview' },
];

const activeTab = ref<'general' | 'css' | 'preview'>('general');
const saving = ref(false);
const saveError = ref('');
const saveOk = ref(false);

const draft = reactive<GhrmBreadcrumbConfig>({ ...props.initialConfig });

watch(
  () => props.initialConfig,
  (cfg) => Object.assign(draft, cfg),
  { deep: true },
);

function reset() {
  Object.assign(draft, props.initialConfig);
  saveError.value = '';
  saveOk.value = false;
}

async function save() {
  saving.value = true;
  saveError.value = '';
  saveOk.value = false;
  try {
    const updated = await ghrmWidgetApi.updateWidget(props.widgetId, { ...draft });
    Object.assign(draft, updated);
    saveOk.value = true;
    emit('saved', updated);
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Save failed';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.ghrm-widget-config__tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 20px;
}
.ghrm-widget-config__tab {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.ghrm-widget-config__tab--active {
  color: #2c3e50;
  font-weight: 600;
  border-bottom-color: #3498db;
}
.ghrm-widget-config__panel { padding: 4px 0 20px; }
.ghrm-widget-config__panel--preview { padding-bottom: 0; }
.ghrm-widget-config__actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
.ghrm-field { margin-bottom: 18px; }
.ghrm-field--checkbox { display: flex; flex-direction: column; gap: 4px; }
.ghrm-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.ghrm-input { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
.ghrm-input--short { width: 120px; }
.ghrm-textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: monospace; resize: vertical; }
.ghrm-hint { font-size: 12px; color: #9ca3af; margin: 4px 0 0; }
.ghrm-hint--preview { margin-bottom: 12px; }
.ghrm-preview-frame { border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; background: #fafafa; min-height: 80px; }
.ghrm-btn { padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; }
.ghrm-btn:disabled { opacity: 0.6; cursor: default; }
.ghrm-btn--primary { background: #3498db; color: #fff; }
.ghrm-btn--primary:hover:not(:disabled) { background: #2980b9; }
.ghrm-btn--secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
.ghrm-btn--secondary:hover:not(:disabled) { background: #e5e7eb; }
.ghrm-error { color: #dc2626; font-size: 13px; margin-top: 8px; }
.ghrm-success { color: #16a34a; font-size: 13px; margin-top: 8px; }
</style>
