// ==UserScript==
// @name         AniList overlap count
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       IAmAsianNoob
// @match        https://anilist.co/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anilist.co
// @require      https://raw.githubusercontent.com/IAmAsianNoob/AMQ-scripts/main/utils/create-element-override.js
// @grant        none
// ==/UserScript==

setTimeout(() => {
    'use strict';

    const comparePagePattern = /user\/*\/.*?list\/compare$/;
    let setup = false;
    let skip = false;
    let entriesContainer, overlapField;
    const lists = ['Watching', 'Completed', 'Paused', 'Dropped', 'Planning'];
    let hiddenCount = 0;

    new MutationObserver(mutationRecords => {
        setTimeout(() => {
            if (!comparePagePattern.test(window.location.pathname)) {
                setup = false;
            }
            if (!setup) {
                setup = 1;
            } else if (setup === 1) {
                setup = true;
                const username = window.location.pathname.match(/user\/(.*?)\//)[1];
                entriesContainer = document.getElementById(username);
                const dataKey = "data-" + Object.keys(entriesContainer.dataset)[0];
                if (!entriesContainer) return;

                const container = document.createElement('div', { id: 'tools', class: "compare", [dataKey]: '' });

                // Filter header
                const filterHeaderRow = document.createElement('div', { class: 'entry header', [dataKey]: '' });
                const filterHeaderField = document.createElement('div', {
                    class: 'title',
                    textContent: 'Filter',
                    [dataKey]: ''
                });
                filterHeaderRow.appendChild(filterHeaderField);
                for (const list of lists) {
                    const cell = document.createElement('div', {
                        textContent: list,
                        [dataKey]: ''
                    });
                    filterHeaderRow.appendChild(cell);
                }
                container.appendChild(filterHeaderRow);

                // Filter self
                const filterSelfRow = document.createElement('div', { class: 'entry header', [dataKey]: '' });
                const filterSelfField = document.createElement('div', {
                    class: 'title',
                    textContent: 'Your List',
                    [dataKey]: ''
                });
                filterSelfRow.appendChild(filterSelfField);
                for (const list of lists) {
                    const cell = document.createElement('div', {
                        [dataKey]: ''
                    });
                    const checkbox = document.createElement('input', {
                        id: `filterSelf${list}`,
                        type: 'checkbox',
                        checked: true,
                        value: list
                    });
                    checkbox.addEventListener('change', onChange);
                    cell.appendChild(checkbox);
                    filterSelfRow.appendChild(cell);
                }
                container.appendChild(filterSelfRow);

                 // Filter other
                const filterOtherRow = document.createElement('div', { class: 'entry header', [dataKey]: '' });
                const filterOtherField = document.createElement('div', {
                    class: 'title',
                    textContent: `${username}'s List`,
                    [dataKey]: ''
                });
                filterOtherRow.appendChild(filterOtherField);
                for (const list of lists) {
                    const cell = document.createElement('div', {
                        [dataKey]: ''
                    });
                    const checkbox = document.createElement('input', {
                        id: `filterOther${list}`,
                        type: 'checkbox',
                        checked: true,
                        value: list
                    });
                    cell.appendChild(checkbox);
                    checkbox.addEventListener('change', onChange);
                    filterOtherRow.appendChild(cell);
                }
                container.appendChild(filterOtherRow);

                // Shared entries
                const sharedRow = document.createElement('div', { class: 'entry header', [dataKey]: '' });
                overlapField = document.createElement('div', {
                    class: 'status',
                    textContent: `Shared: ${entriesContainer.childElementCount - 2 - hiddenCount}`,
                    [dataKey]: ''
                });
                sharedRow.appendChild(overlapField);
                container.appendChild(sharedRow);

                entriesContainer.parentElement.insertBefore(container, entriesContainer);
            } else {
                onChange();
                if (!skip) overlapField.textContent = `Shared: ${entriesContainer.childElementCount - 2 - hiddenCount}`;
                skip = !skip;
            }
        }, 500);
    }).observe(app, { childList: true, subtree: true });

    function onChange() {
        const showSelf = new Set(lists.map(list => document.getElementById(`filterSelf${list}`)).filter(ele => ele.checked).map(ele => ele.value));
        const showOther = new Set(lists.map(list => document.getElementById(`filterOther${list}`)).filter(ele => ele.checked).map(ele => ele.value));
        hiddenCount = 0;

        for (let i = 1; i < entriesContainer.childElementCount - 1; i++) {
            const statusSelf = entriesContainer.children[i].children[3].textContent.trim();
            const statusOther = entriesContainer.children[i].children[4].textContent.trim();
            const display = (showSelf.has(statusSelf) && showOther.has(statusOther)) ? '' : 'none';
            entriesContainer.children[i].style.display = display;
            if (display === 'none') hiddenCount++;
        }
        if (hiddenCount > 0) {
            overlapField.textContent = `Shared: ${entriesContainer.childElementCount - 2 - hiddenCount}`;
        }
    }
}, 100);