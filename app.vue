<template>
  <div class="layout">
    <header class="layout__header">
      <NuxtLink to="/" class="layout__brand">
        <span class="layout__logo">📝</span>
        <span class="layout__title">NoteFlow</span>
      </NuxtLink>
    </header>

    <main class="layout__main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f172a, #020617);
  color: #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
}

.layout__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  backdrop-filter: blur(16px);
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}

.layout__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  text-decoration: none;
}

.layout__brand:hover {
  opacity: 0.9;
}

.layout__logo {
  font-size: 1.25rem;
}

.layout__title {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.layout__main {
  flex: 1;
  padding: 1.5rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .layout__main {
    padding: 1rem;
  }
}
</style>

