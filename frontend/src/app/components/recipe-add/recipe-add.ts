import { Component, EventEmitter, Output, signal, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe';
import { Ingredient, Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-add.html',
  styleUrls: ['./recipe-add.css']
})
export class RecipeAddComponent {

  @Output() recipeAdded = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  isOptimizing: boolean = false;

  title = '';
  description = '';
  isOptimized = false;
  ingredients = signal<Ingredient[]>([
    { name: '', amount: '' }
  ]);

  statusMessage = '';
  isError = false;

  constructor(private recipeService: RecipeService,
    private cdr: ChangeDetectorRef) { }

  optimizeText(): void {
    if (!this.description.trim()) {
      return;
    }

    this.isOptimized = false;
    this.isOptimizing = true;
    this.statusMessage = 'KI optimiert...';


    const prompt = `
Du bist ein professioneller Koch-Assistent.
Extrahiere das Rezept und die Zutaten in folgendem JSON Format.

BEISPIEL:
Eingabe: "200g Mehl und 1 Ei"
Ausgabe: {"description": "...", "ingredients": [{"name": "Mehl", "amount": "200g"}, {"name": "Ei", "amount": "1"}]}

Optimiere den folgenden Text:
Titel: ${this.title}
Text: ${this.description}

Antworte AUSSCHLIESSLICH als gültiges JSON ohne Markdown.
`;

    this.recipeService.improveDescription(prompt).subscribe({
      next: (response: any) => {
        const content = response?.choices?.[0]?.message?.content?.trim();

        if (!content) {
          throw new Error('Empty AI response');
        }

        try {
          const result = JSON.parse(content);

          // this.description = result.description || this.description;
          this.description = this.cleanText(result.description || this.description);

          if (Array.isArray(result.ingredients)) {
            this.ingredients.set(result.ingredients);
          }

          this.isOptimized = true;
          this.statusMessage = '';
        } catch (e) {
          console.error('JSON parse error:', e);
          this.statusMessage = 'KI-Antwort konnte nicht verarbeitet werden.';
          this.isError = true;
        }

        this.isOptimizing = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('AI Error:', err);

        this.isOptimizing = false;
        this.statusMessage = 'Fehler!';

        this.cdr.detectChanges();
      }
    });
  }


  addIngredientInput(): void {
    this.ingredients.update(items => [...items, { name: '', amount: '' }]);
  }


  removeIngredientInput(index: number): void {
    this.ingredients.update(items => items.filter((_, i) => i !== index));
  }

  cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---/g, '')
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }


  submitRecipe(): void {
    if (!this.title.trim() || !this.description.trim()) {
      this.statusMessage = 'Bitte füllen Sie die Felder für Titel und Zubereitung aus.';
      this.isError = true;
      return;
    }

    const validIngredients = this.ingredients().filter(ing => ing.name.trim() !== '');

    const newRecipe: Recipe = {
      title: this.title,
      description: this.description,
      ingredients: validIngredients
    };

    this.recipeService.addRecipe(newRecipe).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.statusMessage = '🎉 Rezept erfolgreich hinzugefügt!';
          this.isError = false;

          this.title = '';
          this.description = '';
          this.ingredients.set([{ name: '', amount: '' }]);

          this.recipeAdded.emit();

          setTimeout(() => this.statusMessage = '', 2000);
        } else {
          this.statusMessage = '❌ Rezept konnte nicht gespeichert werden.';
          this.isError = true;
        }
      },
      error: () => {
        this.statusMessage = '❌ Fehler bei der Serververbindung.';
        this.isError = true;
      }
    });
  }
}