let paginaAtual = 1;
let isLoading = false;
let totalItems = [];
const API_URL = "https://parallelum.com.br/fipe/api/v1/carros/marcas";

function loadItems() {
  if (isLoading) return;
  isLoading = true;

  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      totalItems = [...totalItems, ...data];
      const itemsToDisplay = data.slice((paginaAtual - 1) * 10, paginaAtual * 10);
      itemsToDisplay.forEach(displayItem);
      paginaAtual++;
      isLoading = false;
      checkHeight();
    })
    .catch(error => {
      console.error("Erro ao carregar dados:", error);
      isLoading = false;
    });
}

function displayItem(item) {
  const itemContainer = document.getElementById('item-container');
  const itemElement = document.createElement('div');
  itemElement.classList.add('item');

  itemElement.innerHTML = `
    <h3>${item.nome}</h3>
    <button class="favorite-btn">${checarFavorito(item.codigo) ? "Desfavoritar" : "Favoritar"}</button>
  `;

  itemElement.querySelector('.favorite-btn').addEventListener('click', () => favoritar(item));
  itemContainer.appendChild(itemElement);
}

function scrollInfinito() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) loadItems();
}

function checkHeight() {
  if (document.documentElement.scrollHeight <= document.documentElement.clientHeight) loadItems();
}

window.addEventListener('scroll', scrollInfinito);

function favoritar(item) {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  favoritos = favoritos.some(fav => fav.codigo === item.codigo)
    ? favoritos.filter(fav => fav.codigo !== item.codigo)
    : [...favoritos, item];
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  displayFavoritos();
  updateItemList();
}

function checarFavorito(codigo) {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  return favoritos.some(fav => fav.codigo === codigo);
}

function updateItemList() {
  document.querySelectorAll('#item-container .item').forEach(itemElement => {
    const itemName = itemElement.querySelector('h3').innerText;
    const item = totalItems.find(i => i.nome === itemName);
    itemElement.querySelector('.favorite-btn').textContent = checarFavorito(item.codigo) ? "Desfavoritar" : "Favoritar";
  });
}

function displayFavoritos() {
  const favoritosContainer = document.getElementById('lista-favoritos');
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  favoritosContainer.innerHTML = favoritos.map(fav => `<div><span>${fav.nome}</span></div>`).join('');
}

function filtrarItens(query) {
  const itensFiltrados = totalItems.filter(item => item.nome.toLowerCase().includes(query.toLowerCase()));
  const itemContainer = document.getElementById('item-container');
  itemContainer.innerHTML = '';
  itensFiltrados.forEach(displayItem);
}

document.getElementById('pesquisa').addEventListener('input', e => filtrarItens(e.target.value));

displayFavoritos();
loadItems();