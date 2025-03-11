/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import classNames from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category =
    categoriesFromServer.find(c => c.id === product.categoryId) || null;
  const user = category
    ? usersFromServer.find(u => u.id === category.ownerId) || null
    : null;

  return { ...product, category, user };
});

const headers = [
  { label: 'ID', sortIcon: 'fas fa-sort' },
  { label: 'Product', sortIcon: 'fas fa-sort' },
  { label: 'Category', sortIcon: 'fas fa-sort' },
  { label: 'User', sortIcon: 'fas fa-sort' },
];

function filter(productsList, name, category, query, sortBy, sortOrder) {
  const queryMod = query.trim().toLowerCase();

  let filteredProducts = productsList.filter(product => {
    const matchesName = name ? product.user?.name === name : true;
    const matchesCategory = category
      ? product.category?.title === category
      : true;
    const matchesQuery = queryMod
      ? product.name.toLowerCase().includes(queryMod)
      : true;

    return matchesName && matchesCategory && matchesQuery;
  });

  if (sortBy) {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      let aValue;
      let bValue;

      switch (sortBy) {
        case 'category':
          aValue = a.category?.title || '';
          bValue = b.category?.title || '';
          break;
        case 'user':
          aValue = a.user?.name || '';
          bValue = b.user?.name || '';
          break;
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'product':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  return filteredProducts;
}

export const App = () => {
  const [selectedName, setSelectedName] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = column => {
    setSortOrder(
      prevOrder => (sortBy === column && prevOrder === 'asc' ? 'desc' : 'asc'),
      /* disable for next line */
    );
    setSortBy(column);
  };

  const visibleProducts = filter(
    products,
    selectedName,
    selectedCategory,
    query,
    sortBy,
    sortOrder,
  );

  const getSortIcon = columnKey => {
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }

    return 'fas fa-sort';
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>
            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={classNames({ 'is-active': selectedName === null })}
                onClick={() => setSelectedName(null)}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={classNames({
                    'is-active': selectedName === user.name,
                  })}
                  onClick={() => setSelectedName(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  value={query}
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button mr-6', {
                  'is-success': selectedCategory === null,
                })}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </a>
              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={classNames('button mr-2 my-1', {
                    'is-info': selectedCategory === category.title,
                  })}
                  href="#/"
                  onClick={() => setSelectedCategory(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setSelectedName(null);
                  setSelectedCategory(null);
                  setQuery('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {headers.map(({ label }) => {
                    const columnKey =
                      label.toLowerCase() === 'product'
                        ? 'product'
                        : label.toLowerCase();

                    return (
                      <th key={label} onClick={() => handleSort(columnKey)}>
                        <span className="is-flex is-flex-wrap-nowrap">
                          {label}
                          <a href="#/">
                            <span className="icon">
                              <i
                                data-cy="SortIcon"
                                className={getSortIcon(columnKey)}
                              />
                            </span>
                          </a>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category
                        ? `${product.category.icon} - ${product.category.title}`
                        : 'No category'}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.user?.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user?.name || 'No user'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
