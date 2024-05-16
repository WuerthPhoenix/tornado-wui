import Vue from "vue";
import VueI18n from "vue-i18n";
import translationJson from "@/assets/i18n/translations.json";
import { postTranslations } from "@/api/api";

Vue.use(VueI18n);

const DEFAULT_LOCALE = "en";

const i18n = new VueI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    translationJson,
  },
});

export default i18n;

export async function setLocale(): Promise<void> {
  try {
    const translations = await postTranslations(translationJson);
    if (translations.status === 200) {
      i18n.setLocaleMessage(DEFAULT_LOCALE, translations.data);
    } else {
      console.log("Error: " + translations.statusText);
    }
  } catch (error) {
    console.log("Error: " + error);
  }
}
