/**
 * GHRM Admin Plugin
 *
 * Extends the tariff plan edit page with a "Software" tab.
 * The tab appears only when the plan belongs to a software category.
 */

import type { IPlugin, IPlatformSDK } from 'vbwd-view-component';
import { extensionRegistry } from '../../vue/src/plugins/extensionRegistry';
import GhrmSoftwareTab from './src/components/GhrmSoftwareTab.vue';
import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';
import th from './locales/th.json';
import zh from './locales/zh.json';

const SOFTWARE_CATEGORY_SLUGS = ['backend', 'fe-user', 'fe-admin'];

export const ghrmAdminPlugin: IPlugin = {
  name: 'ghrm-admin',
  version: '1.0.0',
  description: 'GitHub Repo Manager — software tab on tariff plan edit page',

  install(sdk: IPlatformSDK) {
    sdk.addTranslations('en', { ghrm: (en as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('de', { ghrm: (de as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('es', { ghrm: (es as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('fr', { ghrm: (fr as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('ja', { ghrm: (ja as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('ru', { ghrm: (ru as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('th', { ghrm: (th as Record<string, unknown>)['ghrm'] });
    sdk.addTranslations('zh', { ghrm: (zh as Record<string, unknown>)['ghrm'] });

    extensionRegistry.register('ghrm-admin', {
      planTabSections: [
        {
          label: 'Software',
          component: GhrmSoftwareTab,
          requiredCategorySlugs: SOFTWARE_CATEGORY_SLUGS,
        },
      ],
    });
  },

  activate() {
    extensionRegistry.register('ghrm-admin', {
      planTabSections: [
        {
          label: 'Software',
          component: GhrmSoftwareTab,
          requiredCategorySlugs: SOFTWARE_CATEGORY_SLUGS,
        },
      ],
    });
  },

  deactivate() {
    extensionRegistry.unregister('ghrm-admin');
  },
};

export default ghrmAdminPlugin;
