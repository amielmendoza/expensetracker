import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Category, CreateCategory } from '@/types';
import { categoryService } from '@/services/api/categoryService';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const defaultCategories = computed(() => {
    return categories.value.filter((c) => c.isDefault);
  });

  const customCategories = computed(() => {
    return categories.value.filter((c) => !c.isDefault);
  });

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      categories.value = await categoryService.getAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories';
      console.error('Error fetching categories:', err);
      // Don't rethrow - let the component handle the error state
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const category = await categoryService.getById(id);
      const index = categories.value.findIndex((c) => c.id === id);
      if (index >= 0) {
        categories.value[index] = category;
      } else {
        categories.value.push(category);
      }
      return category;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch category';
      console.error('Error fetching category:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(category: CreateCategory) {
    loading.value = true;
    error.value = null;
    try {
      const newCategory = await categoryService.create(category);
      categories.value.push(newCategory);
      return newCategory;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create category';
      console.error('Error creating category:', err);
      throw err; // Re-throw for UI to show error message
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, category: CreateCategory) {
    loading.value = true;
    error.value = null;
    try {
      const updatedCategory = await categoryService.update(id, category);
      const index = categories.value.findIndex((c) => c.id === id);
      if (index >= 0) {
        categories.value[index] = updatedCategory;
      }
      return updatedCategory;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update category';
      console.error('Error updating category:', err);
      throw err; // Re-throw for UI to show error message
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await categoryService.delete(id);
      categories.value = categories.value.filter((c) => c.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete category';
      console.error('Error deleting category:', err);
      throw err; // Re-throw for UI to show error message
    } finally {
      loading.value = false;
    }
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.value.find((c) => c.id === id);
  }

  return {
    categories,
    loading,
    error,
    defaultCategories,
    customCategories,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    getCategoryById,
  };
});

