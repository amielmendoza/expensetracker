<template>
  <div class="categories-page">
    <div class="page-header">
      <h1>Categories</h1>
      <button @click="showAddModal = true" class="btn-primary">+ Add Category</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="categories-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          :style="{ borderLeftColor: category.color }"
        >
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            {{ category.icon }}
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div v-if="!category.isDefault" class="category-actions">
            <button @click="editCategory(category)" class="btn-icon">✏️</button>
            <button @click="deleteCategory(category.id)" class="btn-icon">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showAddModal || editingCategory" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h2>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="categoryForm.name" required />
          </div>
          <div class="form-group">
            <label>Icon (emoji) *</label>
            <input v-model="categoryForm.icon" required />
          </div>
          <div class="form-group">
            <label>Color *</label>
            <input v-model="categoryForm.color" type="color" required />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';
import type { Category } from '@/types';

const categoryStore = useCategoryStore();

const { categories, loading, error } = storeToRefs(categoryStore);
const { fetchAll, create, update, remove } = categoryStore;

const showAddModal = ref(false);
const editingCategory = ref<Category | null>(null);

const categoryForm = reactive({
  name: '',
  icon: '',
  color: '#000000',
});

onMounted(async () => {
  try {
    await fetchAll();
  } catch (err) {
    console.error('Error loading categories:', err);
    // Error is already handled in the store, just log it here
  }
});

function editCategory(category: Category) {
  editingCategory.value = category;
  categoryForm.name = category.name;
  categoryForm.icon = category.icon;
  categoryForm.color = category.color;
}

function closeModal() {
  showAddModal.value = false;
  editingCategory.value = null;
  resetForm();
}

function resetForm() {
  categoryForm.name = '';
  categoryForm.icon = '';
  categoryForm.color = '#000000';
}

async function saveCategory() {
  try {
    if (editingCategory.value) {
      await update(editingCategory.value.id, categoryForm);
    } else {
      await create(categoryForm);
    }
    closeModal();
  } catch (err) {
    console.error('Failed to save category:', err);
  }
}

async function deleteCategory(id: string) {
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      await remove(id);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  }
}
</script>

<style scoped>
.categories-page {
  padding: 3rem 0 2rem 0;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.loading,
.error {
  text-align: center;
  padding: 3rem 2rem;
}

.loading {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  border-left: 4px solid;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.category-card:hover::before {
  opacity: 1;
}

.category-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.1) rotate(5deg);
}

.category-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}

.category-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.btn-icon {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h2 {
  margin: 0 0 2rem 0;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: var(--bg-secondary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}
</style>

