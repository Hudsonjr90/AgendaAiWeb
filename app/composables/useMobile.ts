import { computed } from "vue";
import { useQuasar } from "quasar";

export const useMobile = () => {
  const $q = useQuasar();

  const isMobile = computed(() => $q.screen.lt.sm);
  const isTablet = computed(() => $q.screen.lt.md && !$q.screen.lt.sm);

  return {
    isMobile,
    isTablet,
  };
};
