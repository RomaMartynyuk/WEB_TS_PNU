export class NavigationService {
    constructor() {
        this.currentPage = 'home';
    }
    navigateTo(page) {
        const pages = ['homePage', 'workoutPage', 'historyPage'];
        pages.forEach(pageId => {
            const element = document.getElementById(pageId);
            if (element) {
                element.classList.add('hidden');
            }
        });
        const targetPage = document.getElementById(page + 'Page');
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = page;
            this.updateActiveTab(page);
            this.updateFloatingElements(page);
        }
    }
    getCurrentPage() {
        return this.currentPage;
    }
    updateActiveTab(page) {
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        let activeTabId = '';
        if (page === 'home')
            activeTabId = 'homeTabLink';
        else if (page === 'workout')
            activeTabId = 'workoutTabLink';
        else if (page === 'history')
            activeTabId = 'historyTabLink';
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    updateFloatingElements(page) {
        const floatingAddBtn = document.getElementById('floatingAddBtn');
        if (floatingAddBtn) {
            if (page === 'workout') {
                floatingAddBtn.classList.remove('hidden');
            }
            else {
                floatingAddBtn.classList.add('hidden');
            }
        }
    }
}
