// Personal Platz - Сервіс навігації
// Управління переходами між сторінками та станом інтерфейсу

import { PageType } from './types.js';

export class NavigationService {
    private currentPage: PageType = 'home';

    public navigateTo(page: PageType): void {
        // Ховаємо всі сторінки
        const pages: string[] = ['homePage', 'workoutPage', 'historyPage'];
        pages.forEach(pageId => {
            const element: HTMLElement | null = document.getElementById(pageId);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Показуємо обрану сторінку
        const targetPage: HTMLElement | null = document.getElementById(page + 'Page');
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = page;
            this.updateActiveTab(page);
            this.updateFloatingElements(page);
        }
    }

    public getCurrentPage(): PageType {
        return this.currentPage;
    }

    private updateActiveTab(page: PageType): void {
        // Видаляємо активний клас з усіх табів
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });

        // Додаємо активний клас до поточного табу
        let activeTabId: string = '';
        if (page === 'home') activeTabId = 'homeTabLink';
        else if (page === 'workout') activeTabId = 'workoutTabLink';
        else if (page === 'history') activeTabId = 'historyTabLink';

        const activeTab: HTMLElement | null = document.getElementById(activeTabId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    private updateFloatingElements(page: PageType): void {
        const floatingAddBtn: HTMLElement | null = document.getElementById('floatingAddBtn');
        
        if (floatingAddBtn) {
            if (page === 'workout') {
                floatingAddBtn.classList.remove('hidden');
            } else {
                floatingAddBtn.classList.add('hidden');
            }
        }
    }
}