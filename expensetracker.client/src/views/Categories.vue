<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Categories</h1>
      </div>
      <div class="header-right">
        <button class="btn-add" @click="openAddModal">+ Add Category</button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        class="filter-tab"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        All
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'expense' }"
        @click="filter = 'expense'"
      >
        Expense
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'income' }"
        @click="filter = 'income'"
      >
        Income
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading categories...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-secondary">Retry</button>
    </div>
    <div v-else>
      <div v-if="filteredCategories.length === 0" class="empty-state">
        <div class="empty-icon">🏷️</div>
        <h3>No categories found</h3>
        <p>Create custom categories to organize your transactions!</p>
        <button @click="openAddModal" class="btn-add">+ Add Category</button>
      </div>
      <div v-else class="categories-grid">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="category-card"
        >
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            {{ category.icon }}
          </div>
          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <span class="category-type" :class="getTypeClass(category.type)">
              {{ getTypeLabel(category.type) }}
            </span>
          </div>
          <div class="category-actions" v-if="!category.isDefault">
            <button @click="editCategory(category)" class="btn-icon" title="Edit">✏️</button>
            <button @click="deleteCategory(category.id)" class="btn-icon delete" title="Delete">🗑️</button>
          </div>
          <div v-else class="default-badge">Default</div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :visible="!!deletingId"
      title="Delete Category?"
      message="Transactions using this category may be affected. This action cannot be undone."
      confirm-text="Delete"
      icon="🗑️"
      @confirm="confirmDelete"
      @cancel="deletingId = null"
    />

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingCategory" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label>Category Name *</label>
            <input
              v-model="categoryForm.name"
              type="text"
              placeholder="e.g., Groceries, Salary"
              required
            />
          </div>
          <div class="form-group">
            <label>Icon *</label>
            <div class="icon-picker">
              <div class="icon-preview" :class="{ empty: !categoryForm.icon }">
                {{ categoryForm.icon || '?' }}
              </div>
              <div class="icon-picker-grid">
                <div v-for="(icons, group) in iconGroups" :key="group" class="icon-group">
                  <div class="icon-group-label">{{ group }}</div>
                  <div class="icon-group-icons">
                    <button
                      v-for="icon in icons"
                      :key="icon"
                      type="button"
                      class="icon-btn"
                      :class="{ selected: categoryForm.icon === icon }"
                      @click="categoryForm.icon = icon"
                    >
                      {{ icon }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Color *</label>
              <div class="color-picker">
                <input
                  v-model="categoryForm.color"
                  type="color"
                  required
                />
                <div class="color-presets">
                  <button
                    v-for="color in presetColors"
                    :key="color"
                    type="button"
                    class="color-btn"
                    :style="{ backgroundColor: color }"
                    @click="categoryForm.color = color"
                  ></button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Type *</label>
              <select v-model.number="categoryForm.type" required>
                <option :value="0">Expense</option>
                <option :value="1">Income</option>
                <option :value="2">Both</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-add">{{ editingCategory ? 'Update' : 'Add' }} Category</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';
import { useToast } from '@/composables/useToast';
import ConfirmModal from '@/components/ConfirmModal.vue';
import type { Category } from '@/types';
import { CategoryType } from '@/types';

const categoryStore = useCategoryStore();
const { showSuccess, showError } = useToast();

const { categories, loading, error } = storeToRefs(categoryStore);
const { fetchAll, create, update, remove } = categoryStore;

const filter = ref<'all' | 'expense' | 'income'>('all');

const filteredCategories = computed(() => {
  if (!categories.value) return [];
  if (filter.value === 'all') return categories.value;
  if (filter.value === 'expense') {
    return categories.value.filter(c => c.type === CategoryType.Expense || c.type === CategoryType.Both);
  }
  return categories.value.filter(c => c.type === CategoryType.Income || c.type === CategoryType.Both);
});

const showAddModal = ref(false);
const editingCategory = ref<Category | null>(null);

const categoryForm = reactive({
  name: '',
  icon: '',
  color: '#6366f1',
  type: CategoryType.Expense,
});

const iconGroups: Record<string, string[]> = {
  'Food & Drink': ['🍔', '🍕', '🍜', '🍣', '🥗', '🍰', '☕', '🍺', '🥤', '🍳'],
  'Transport': ['🚗', '🚌', '🚇', '✈️', '⛽', '🚲', '🛵', '🚕', '🚁', '🛳️'],
  'Home': ['🏠', '🛋️', '🔧', '🧹', '💡', '🚿', '🏗️', '🪴'],
  'Shopping': ['🛒', '👕', '👟', '💄', '🎁', '🛍️', '💎', '🕶️'],
  'Health': ['🏥', '💊', '🏋️', '🧘', '🦷', '👁️', '🩺', '💉'],
  'Entertainment': ['🎬', '🎮', '🎵', '📚', '🎨', '🎭', '🎯', '🎳'],
  'Finance': ['💰', '💳', '🏦', '📈', '💵', '🧾', '💸', '🪙'],
  'Work': ['💼', '💻', '📱', '📧', '🖨️', '📊', '🗂️', '✏️'],
  'Education': ['🎓', '📖', '🔬', '🧪', '📐', '🌐', '🧠', '📝'],
  'Pets & Nature': ['🐱', '🐶', '🐟', '🌳', '🌸', '🐾', '🦜', '🐰'],
  'Other': ['⭐', '❤️', '🔔', '📌', '🏷️', '🎉', '🔑', '📦'],
};
const presetColors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

function getTypeLabel(type: CategoryType): string {
  const labels = {
    [CategoryType.Expense]: 'Expense',
    [CategoryType.Income]: 'Income',
    [CategoryType.Both]: 'Both',
  };
  return labels[type] || 'Unknown';
}

function getTypeClass(type: CategoryType): string {
  const classes = {
    [CategoryType.Expense]: 'expense',
    [CategoryType.Income]: 'income',
    [CategoryType.Both]: 'both',
  };
  return classes[type] || '';
}

async function retryLoad() {
  try {
    await fetchAll();
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

onMounted(async () => {
  await retryLoad();
});

function editCategory(category: Category) {
  editingCategory.value = category;
  categoryForm.name = category.name;
  categoryForm.icon = category.icon;
  categoryForm.color = category.color;
  categoryForm.type = category.type;
}

function openAddModal() {
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingCategory.value = null;
  resetForm();
}

function resetForm() {
  categoryForm.name = '';
  categoryForm.icon = '';
  categoryForm.color = '#6366f1';
  categoryForm.type = CategoryType.Expense;
}

async function saveCategory() {
  try {
    if (editingCategory.value) {
      await update(editingCategory.value.id, categoryForm);
      showSuccess('Category updated');
    } else {
      await create(categoryForm);
      showSuccess('Category created');
    }
    closeModal();
  } catch (err) {
    showError('Failed to save category');
    console.error('Failed to save category:', err);
  }
}

const deletingId = ref<string | null>(null);

function deleteCategory(id: string) {
  deletingId.value = id;
}

async function confirmDelete() {
  if (!deletingId.value) return;
  try {
    await remove(deletingId.value);
    showSuccess('Category deleted');
  } catch (err) {
    showError('Failed to delete category');
    console.error('Failed to delete category:', err);
  } finally {
    deletingId.value = null;
  }
}
</script>

<style scoped>
.page-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.btn-add {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--bg-secondary);
  padding: 0.375rem;
  border-radius: 10px;
  width: fit-content;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--bg-primary);
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.category-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-type {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.category-type.expense {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.category-type.income {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.category-type.both {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.category-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--border);
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.default-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.icon-picker {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.icon-preview {
  width: 56px;
  height: 56px;
  border: 2px solid var(--border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: var(--bg-primary);
  flex-shrink: 0;
}

.icon-preview.empty {
  color: var(--text-secondary);
  font-size: 1.5rem;
}

.icon-picker-grid {
  flex: 1;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.5rem;
  background: var(--bg-primary);
}

.icon-group {
  margin-bottom: 0.5rem;
}

.icon-group:last-child {
  margin-bottom: 0;
}

.icon-group-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.25rem 0.25rem 0.25rem;
}

.icon-group-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 1.15rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--border);
  transform: scale(1.1);
}

.icon-btn.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
  transform: scale(1.1);
}

.color-picker input[type="color"] {
  width: 100%;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-presets {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.color-btn {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.2);
  border-color: var(--text-primary);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .filter-tabs {
    width: 100%;
    justify-content: center;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 1.5rem;
  }
}
</style>
