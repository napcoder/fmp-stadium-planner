export function makeTitleContainer(mainTitle?: string | null, subTitle?: string | null, showBorder: boolean = true): HTMLElement {
    const title = document.createElement('div');
    title.className = 'title';
    if (showBorder === false) {
        title.style.border = 'none';
        title.style.margin = '0';
    }

    if (mainTitle) {
        const main = document.createElement('div');
        main.className = 'main';
        main.textContent = mainTitle;
        title.appendChild(main);
    }

    if (subTitle) {
        const section = document.createElement('div');
        section.className = 'section';
        section.textContent = subTitle;
        title.appendChild(section);
    }
    return title;
}