export class RecipeSortSetting {
    public field: string = '';
    public dir: string = '';

    constructor(field: string, dir: string) {
        this.field = field;
        this.dir = dir;
    }
}