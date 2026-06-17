import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../../logo/logo.component'; // مسار ملف المكون الخاص بك
import { RecipeService } from '../../services/recipe';
import { Recipe } from '../../models/recipe.model';
import { RecipeAddComponent } from '../recipe-add/recipe-add';
import { RecipePreviewComponent } from '../recipe-preview/recipe-preview.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeAddComponent, RouterModule, LogoComponent, RecipePreviewComponent], // <-- أضفناه هنا في المصفوفة
  templateUrl: './recipe-list.html',
  styleUrls: ['./recipe-list.css']
})

export class RecipeListComponent implements OnInit {
  recipes = signal<Recipe[]>([]);
  searchTerm = signal<string>('');
  sortBy = signal<string>('created');
  sortDirection = signal<string>('desc');
  isAddModalOpen = signal<boolean>(false);

  hoveredRecipe = signal<Recipe | null>(null);
  previewLoading = signal<boolean>(false);
  expandedRecipes = new Set<number>();

  selectedRecipeForEmail = signal<Recipe | null>(null);
  friendEmail = '';
  emailStatusMessage = '';

  selectedRecipe: any = null;
  isPreviewOpen: boolean = false;

  openPreview(recipe: any) {
    this.selectedRecipe = recipe;
    this.isPreviewOpen = true;
  }

  ngOnInit(): void {
    console.log('RecipeListComponent initialized');
  }

  constructor(private recipeService: RecipeService) {
    effect(() => {
      // هذه الـ Signals سيتم مراقبتها تلقائياً
      const term = this.searchTerm();
      const sort = this.sortBy();
      const dir = this.sortDirection();

      this.loadRecipes(term, sort, dir);
    }, { allowSignalWrites: true });
  }

  loadRecipes(term: string = '', sort: string = 'created', dir: string = 'desc'): void {
    this.recipeService.getRecipes(term, sort, dir).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.recipes.set(response.data);
        }
      },
      error: (err) => console.error('Error loading recipes', err)
    });
  }

  // ميزة الـ Sorting الديناميكية عند تغيير الخيارات
  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    // قيمنا هي "created-desc" أو "title-asc" أو "title-desc"
    const [field, direction] = value.split('-');

    this.sortBy.set(field);
    this.sortDirection.set(direction);
  }

  // ميزة الـ AJAX Hover Preview الذكية عند ملامسة الماوس لعنوان الطبخة
  onMouseEnterRecipe(id: number | undefined): void {
    if (!id) return;
    this.previewLoading.set(true);

    this.recipeService.getRecipeById(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.hoveredRecipe.set(response.data);
        }
        this.previewLoading.set(false);
      },
      error: () => this.previewLoading.set(false)
    });
  }

  onMouseLeaveRecipe(): void {
    // تفريغ المعاينة فور خروج الماوس
    this.hoveredRecipe.set(null);
  }

  // ميزة فتح مودال أو نافذة إرسال الإيميل
  openEmailModal(recipe: Recipe): void {
    this.selectedRecipeForEmail.set(recipe);
    this.friendEmail = '';
    this.emailStatusMessage = '';
  }

  toggleExpand(recipeId: number | undefined) {
    if (recipeId === undefined) return; // حماية من القيم غير المعرفة

    if (this.expandedRecipes.has(recipeId)) {
      this.expandedRecipes.delete(recipeId);
    } else {
      this.expandedRecipes.add(recipeId);
    }
  }

  isExpanded(recipeId: number | undefined): boolean {
    if (recipeId === undefined) return false;
    return this.expandedRecipes.has(recipeId);
  }

  sendEmail(): void {
    const recipeId = this.selectedRecipeForEmail()?.id;
    if (!recipeId || !this.friendEmail) return;

    this.emailStatusMessage = 'Sending...';
    this.recipeService.sendEmail(recipeId, this.friendEmail).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.emailStatusMessage = '✅ Recipe sent successfully to your friend!';
          setTimeout(() => this.selectedRecipeForEmail.set(null), 2000);
        } else {
          this.emailStatusMessage = '❌ Failed to send email.';
        }
      },
      error: () => this.emailStatusMessage = '❌ Error connection.'
    });
  }
}