/**
 *
 * Lists
 *
 * Interface.Plugins.List page content scripts. Initialized from scripts.js file.
 *
 *
 */

class Lists {
  constructor() {
    if (typeof List === 'undefined') {
      console.log('List is undefined!');
      return;
    }

    this._initExistingHtmlList();
    this._initExistingHtmlListScrollbar();
    this._initAddingViaJS();
    this._initSortAndFilter();
    this._initSortFilterAndPagination();
  }

  // List with existing HTML
  _initExistingHtmlList() {
    if (document.getElementById('existingHtmlList')) {
      var existingHtmlList = new List('existingHtmlList', {valueNames: ['name', 'position']});
    }
  }

  // Scrollable list with existing html
  _initExistingHtmlListScrollbar() {
    if (document.getElementById('existingHtmlListScrollbar')) {
      // Custom listClass to make it work with OverlayScrollbar
      var existingHtmlListScrollbar = new List('existingHtmlListScrollbar', {valueNames: ['name', 'position'], listClass: 'os-content'});
    }
  }

  // Creating list by adding from js
  _initAddingViaJS() {
    if (document.getElementById('addingViaJS')) {
      var options = {
        item: 'addingViaJSlItemTemplate',
        valueNames: ['name', {name: 'image', attr: 'src'}],
      };
      var values = [
        {
          name: 'Peg Bread',
          image: 'img/product/small/product-1.webp',
        },
        {
          name: 'Tunnbröd',
          image: 'img/product/small/product-2.webp',
        },
        {
          name: 'Samoon',
          image: 'img/product/small/product-3.webp',
        },
        {
          name: 'Rieska',
          image: 'img/product/small/product-4.webp',
        },
      ];
      var addingViaJS = new List('addingViaJS', options, values);
    }
  }

  // Sorting and filtering a scrollable list
  // BITS-42: Add Sort and Filter List Element - AWasko - 6/16/2022
  _initSortAndFilter() {

      // Temporary Document Sort and Filter list creation
      if (document.getElementById('sortAndFilter2')) {
        var sortAndFilter2 = new List('sortAndFilter2', {valueNames: ['name', 'category', 'sale'], listClass: 'os-content'});
  
        document.querySelectorAll('#sortAndFilter2 .filter').forEach((el) => {
          el.addEventListener('change', (event) => {
            filterCategory();
          });
        });
      }
      
    // Project Sort and Filter list creation
    if (document.getElementById('sortAndFilter')) {
      var sortAndFilter = new List('sortAndFilter', {valueNames: ['projectID', 'projectName', 'networkType', 'transmissionType', 'lastEditDate'], listClass: 'os-content'});

      document.querySelectorAll('#sortAndFilter .filter').forEach((el) => {
        el.addEventListener('change', (event) => {
          filterNetworkType();
        });
      });
    }
    // New Project Sort and Filter if statement Created for ViewProject.html page
    if (document.getElementById('sortAndFilterView')) {
      var sortAndFilterView = new List('sortAndFilterView', {valueNames: ['projectID', 'projectName', 'networkType', 'transmissionType', 'lastEditDate'], listClass: 'os-content'});

      document.querySelectorAll('#sortAndFilterView .filter').forEach((el) => {
        el.addEventListener('change', (event) => {
          filterNetworkTypeView();
        });
      });
    }

    // Filter the network type of the project sort and filter list
    function filterNetworkType() {
      let selectedNetworkTypes = [];

      document.querySelectorAll('#sortAndFilter .filter:checked').forEach((el) => {
        selectedNetworkTypes.push(el.getAttribute('data-filter'));
      });
      sortAndFilter.filter((item) => {
        return selectedNetworkTypes.indexOf(item.values().networkType.trim()) >= 0;
      });
    }
    //BITS-43 New Function for sorting new View Project SortandFilter element
    function filterNetworkTypeView() {
      let selectedNetworkTypesView = [];

      document.querySelectorAll('#sortAndFilterView .filter:checked').forEach((el) => {
        selectedNetworkTypesView.push(el.getAttribute('data-filter'));
      });
      sortAndFilterView.filter((item) => {
        return selectedNetworkTypesView.indexOf(item.values().networkTypeView.trim()) >= 0;
      });
    }

    // Filter the category type of the temporary document sort and filter list
    function filterCategory() {
      let selectedCategories = [];

      document.querySelectorAll('#sortAndFilter2 .filter:checked').forEach((el) => {
        selectedCategories.push(el.getAttribute('data-filter'));
      });
      sortAndFilter2.filter((item) => {
        return selectedCategories.indexOf(item.values().category.trim()) >= 0;
      });
    }

  }

  // Sorting and filtering a list with a pagination
  _initSortFilterAndPagination() {
    if (document.getElementById('pagination')) {
      var pagination = new List('pagination', {
        valueNames: ['name', 'category', 'sale'],
        page: 3,
        pagination: [
          {
            includeDirectionLinks: true,
            leftDirectionText: '<i class="cs-chevron-left"></i>',
            rightDirectionText: '<i class="cs-chevron-right"></i>',
            liClass: 'page-item',
            aClass: 'page-link shadow',
            innerWindow: 1000, // Hiding ellipsis
          },
        ],
      });
      document.querySelectorAll('#pagination .filter').forEach((el) => {
        el.addEventListener('change', (event) => {
          filterCategory();
        });
      });
    }
    function filterCategory() {
      let selectedCategories = [];
      document.querySelectorAll('#pagination .filter:checked').forEach((el) => {
        selectedCategories.push(el.getAttribute('data-filter'));
      });
      pagination.filter((item) => {
        return selectedCategories.indexOf(item.values().category.trim()) >= 0;
      });
    }
  }
}
