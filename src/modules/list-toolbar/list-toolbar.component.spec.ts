import {
  TestBed,
  async,
  ComponentFixture
} from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  ListState,
  ListStateDispatcher
} from '../list/state';
import { SkyListToolbarModule } from './';
import {
  ListToolbarTestComponent
} from './fixtures/list-toolbar.component.fixture';

import { expect } from '../testing';

import {
  ListViewsLoadAction,
  ListViewsSetActiveAction,
  ListViewModel,
  ListToolbarItemModel,
  ListToolbarItemsLoadAction,
  ListToolbarSetTypeAction,
  ListSortLabelModel,
  ListPagingSetPageNumberAction
} from '../list/state';

describe('List Toolbar Component', () => {
  describe('List Toolbar Fixture', () => {
    let state: ListState,
        dispatcher: ListStateDispatcher,
        fixture: ComponentFixture<ListToolbarTestComponent>,
        nativeElement: HTMLElement,
        component: ListToolbarTestComponent,
        element: DebugElement;

    beforeEach(async(() => {
      dispatcher = new ListStateDispatcher();
      state = new ListState(dispatcher);

      TestBed.configureTestingModule({
        declarations: [
          ListToolbarTestComponent
        ],
        imports: [
          SkyListToolbarModule
        ],
        providers: [
          { provide: ListState, useValue: state },
          { provide: ListStateDispatcher, useValue: dispatcher }
        ]
      });

      fixture = TestBed.createComponent(ListToolbarTestComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
      element = fixture.debugElement as DebugElement;
      component = fixture.componentInstance;
    }));

    function initializeToolbar() {
      fixture.detectChanges();
      // always skip the first update to ListState, when state is ready
      // run detectChanges once more then begin tests
      state.skip(1).take(1).subscribe(() => fixture.detectChanges());
    }

    describe('search', () => {
      it('should be visible by default', async(() => {
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(element.query(By.css('input'))).not.toBeNull();
        });
      }));

      it('should be able to disable search on initialization', async(() => {
        component.searchEnabled = false;
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(element.query(By.css('input'))).toBeNull();
        });
      }));

      it('should set search text on initialization', async(() => {
        component.searchText = 'searchText';
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(component.toolbar.searchComponent.searchText).toBe('searchText');
        });
      }));

      it('should update list state search text on component apply', async(() => {
        let stateChecked = false;
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();

          component.toolbar.searchComponent.applySearchText('something');
          fixture.detectChanges();
          state.take(1).subscribe((s) => {
            expect(s.search.searchText).toBe('something');
            stateChecked = true;
          });
          fixture.detectChanges();
          expect(stateChecked).toBe(true);
        });
      }));

      it('should set pagination to first page when when searching', async(() => {
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          dispatcher.next(
            new ListPagingSetPageNumberAction(Number(2))
          );

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            component.toolbar.searchComponent.applySearchText('something');
            fixture.detectChanges();
            state.take(1).subscribe((s) => {
              expect(s.search.searchText).toBe('something');
              expect(s.paging.pageNumber).toBe(1);
            });
            fixture.detectChanges();
          });
        });
      }));

      it('should not set pagination to first page when pagination is undefined', async(() => {
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            component.toolbar.searchComponent.applySearchText('something');
            fixture.detectChanges();
            state.take(1).subscribe((s) => {
              expect(s.search.searchText).toBe('something');
              expect(s.paging.pageNumber).not.toBe(1);
            });
            fixture.detectChanges();
          });
        });
      }));
    });

     describe('sort selector', () => {
      beforeEach(async(() => {
        dispatcher.sortSetAvailable([
          new ListSortLabelModel({
            text: 'Status (A - Z)',
            fieldType: 'string',
            fieldSelector: 'status',
            global: true,
            descending: false
          }),
           new ListSortLabelModel({
            text: 'Status (Z - A)',
            fieldType: 'string',
            fieldSelector: 'status',
            global: true,
            descending: true
          }),
          new ListSortLabelModel({
            text: 'Date (Most recent first)',
            fieldType: 'date',
            fieldSelector: 'date',
            global: true,
            descending: true
          }),
          new ListSortLabelModel({
            text: 'Date (Most recent last)',
            fieldType: 'date',
            fieldSelector: 'date',
            global: true,
            descending: false
          }),
          new ListSortLabelModel({
            text: 'Number (Highest first)',
            fieldType: 'number',
            fieldSelector: 'number',
            global: true,
            descending: true
          }),
           new ListSortLabelModel({
            text: 'Number (Lowest first)',
            fieldType: 'number',
            fieldSelector: 'number',
            global: true,
            descending: false
          })
        ]);

      }));

      it('should display when sort provided', async(() => {
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(element.query(
            By.css("sky-list-toolbar-item-renderer[sky-cmp-id='sort-selector']")
          )).not.toBeNull();
        });

      }));

      it('should not display when sortSelectorEnabled is false', async(() => {
        component.sortEnabled = false;
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(element.query(By.css('.sky-sort'))).toBeNull();
        });
      }));

      it('should create ascending and descending items for each sort label', async(() => {
        initializeToolbar();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          let sortItems = nativeElement.querySelectorAll('.sky-sort .sky-sort-item');
          expect(sortItems.length).toBe(8);
          expect(sortItems.item(2)).toHaveText('Status (A - Z)');
          expect(sortItems.item(3)).toHaveText('Status (Z - A)');
          expect(sortItems.item(4)).toHaveText('Date (Most recent first)');
          expect(sortItems.item(5)).toHaveText('Date (Most recent last)');
          expect(sortItems.item(6)).toHaveText('Number (Highest first)');
          expect(sortItems.item(7)).toHaveText('Number (Lowest first)');
          expect(sortItems.item(0)).toHaveText('Custom');
          expect(sortItems.item(1)).toHaveText('Custom');
        });

      }));

      it('should handle sort item click', async(() => {
        initializeToolbar();
         fixture.whenStable().then(() => {
           fixture.detectChanges();
          let sortSelectorDropdownButtonEl = nativeElement
            .querySelector('.sky-sort .sky-dropdown-button') as HTMLButtonElement;
          sortSelectorDropdownButtonEl.click();

          let sortItems = nativeElement.querySelectorAll('.sky-sort-item');

          let clickItem = sortItems.item(1).querySelector('button') as HTMLButtonElement;

          clickItem.click();
          fixture.detectChanges();
          sortItems = nativeElement.querySelectorAll('.sky-sort-item');
          expect(sortItems.item(1)).toHaveCssClass('sky-sort-item-selected');

          clickItem = sortItems.item(0).querySelector('button') as HTMLButtonElement;

          clickItem.click();
          fixture.detectChanges();
          sortItems = nativeElement.querySelectorAll('.sky-sort-item');
          expect(sortItems.item(0)).toHaveCssClass('sky-sort-item-selected');
         });

      }));
    });

    it('should load custom items', async(() => {
      initializeToolbar();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let items = element.queryAll(By.css('.sky-toolbar-item'));
        expect(items[0].nativeElement).toHaveText('');
        expect(items[1].query(By.css('input'))).not.toBeNull();
        expect(items[2].query(By.css('.sky-sort'))).not.toBeNull();
        expect(items[3].nativeElement).toHaveText('Custom Item');
        expect(items[4].nativeElement).toHaveText('Custom Item 2');
      });

    }));

    function verifySearchTypeToolbar() {
      fixture.detectChanges();
      let sections = element.queryAll(By.css('.sky-list-toolbar-search .sky-toolbar-section'));
      expect(sections.length).toBe(2);
      expect(sections[0].query(By.css('input'))).not.toBeNull();
      expect(component.toolbar.searchComponent.expandMode).toBe('fit');
      let items = sections[1].queryAll(By.css('.sky-toolbar-item sky-list-toolbar-item-renderer'));
      expect(items[0].nativeElement).toHaveText('');
      expect(items[1].query(By.css('.sky-sort'))).not.toBeNull();
      expect(items[2].nativeElement).toHaveText('Custom Item');
      expect(items[3].nativeElement).toHaveText('Custom Item 2');
    }

    it('should load custom items with toolbarType = search initialized', async(() => {
      component.toolbarType = 'search';
      initializeToolbar();
      fixture.whenStable().then(() => {
        verifySearchTypeToolbar();
      });

    }));

    it('should load custom items with toolbarType = search set by the state', async(() => {
      initializeToolbar();

      dispatcher.next(new ListToolbarSetTypeAction('search'));
      fixture.whenStable().then(() => {
        verifySearchTypeToolbar();
      });

    }));

    it('should not display items not in the current view', async(() => {

      initializeToolbar();
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        dispatcher.next(
          new ListViewsLoadAction([new ListViewModel('myview', 'view label')])
        );
        fixture.detectChanges();

          // activate the default view
        dispatcher.next(new ListViewsSetActiveAction('myview'));
        fixture.detectChanges();

        dispatcher.next(new ListToolbarItemsLoadAction([
          new ListToolbarItemModel({
            id: 'newitem',
            location: 'center',
            view: 'myview',
            template: component.default
          })
        ]));
        fixture.detectChanges();

        let items = element.queryAll(By.css('.sky-toolbar-item'));
        expect(items[0].nativeElement).toHaveText('');
        expect(items[1].query(By.css('input'))).not.toBeNull();
        expect(items[2].query(By.css('span')).nativeElement).toHaveCssClass('sky-test-toolbar');
        expect(items[3].query(By.css('.sky-sort'))).not.toBeNull();
        expect(items[4].nativeElement).toHaveText('Custom Item');
        expect(items[5].nativeElement).toHaveText('Custom Item 2');

         dispatcher.next(new ListToolbarItemsLoadAction([
          new ListToolbarItemModel({
            id: 'newitem2',
            location: 'center',
            view: 'myview1',
            template: component.default
          })
        ]));
        fixture.detectChanges();

        items = element.queryAll(By.css('.sky-toolbar-item'));
        expect(items[0].nativeElement).toHaveText('');
        expect(items[1].query(By.css('input'))).not.toBeNull();
        expect(items[2].query(By.css('span')).nativeElement).toHaveCssClass('sky-test-toolbar');
        expect(items[3].query(By.css('.sky-sort'))).not.toBeNull();
        expect(items[4].nativeElement).toHaveText('Custom Item');
        expect(items[5].nativeElement).toHaveText('Custom Item 2');

      });
    }));
  });
});
