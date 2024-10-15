const $ = n => document.querySelector(n);

const $select = $('#categorias');
const $result = $('#resultado');
const $favoritos = $('.favoritos');

function startApp() {

    const modal = new bootstrap.Modal('#modal', {});

    if($select) {
        $select.addEventListener('change', selectCategory);
        APICategory();
    }
    if($favoritos) {
        getFavorites();
    }

    $result.addEventListener('click', e => {
        if(e.target.classList.contains('btn-recetas')) {
            const targetID = e.target.getAttribute('data-id');
            findMeals(targetID);
        }
    })

    function APICategory() {
        const categoryURL = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(categoryURL)
            .then(response => response.json())
            .then(categories => displayCategories(categories.categories))
    }

    function displayCategories(categories = []) {
        categories.forEach(category => {
            const {strCategory, idCategory} = category;
            const option = document.createElement('option');
            option.textContent = strCategory;
            option.value = strCategory;
            
            $select.appendChild(option);
        })
    }

    function selectCategory(e) {
        const category = e.target.value;
        const filterURL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
        
        fetch(filterURL)
            .then(response => response.json())
            .then(filter => displayMeals(filter.meals))
    }

    function displayMeals(meals = []) {
        $result.innerHTML = '';

        const heading = document.createElement('h3');
        heading.classList.add('text-center', 'text-black', 'my-4');
        heading.textContent = meals.length ? 'Recetas': 'No se encontraron recetas';
        $result.appendChild(heading);

        meals.forEach(meal => {
            const {idMeal, strMeal, strMealThumb} = meal;
            const div = document.createElement('div');
            div.classList.add('col-md-4');
            div.innerHTML = `
                <div class="card mb-4">
                    <img class="card-img-top" alt=${strMeal ?? meal.title} src=${strMealThumb ?? meal.img}>
                    <div class="card-body">
                        <h3 class="card-title mb-3">${strMeal ?? meal.title}</h3>
                        <button data-id="${idMeal ?? meal.id}" class="btn-recetas btn btn-danger w-100">Ver receta</button>
                    </div>
                </div>
            `;
            // data-bs-target="#modal" data-bs-toggle="modal"
            $result.appendChild(div);
        })
    }

    function findMeals(id) {
        const mealURL = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        
        fetch(mealURL)
            .then(response => response.json())
            .then(meal => displayMealModal(meal.meals[0]))
    }

    function displayMealModal(meal) {
        const {strInstructions, idMeal, strMeal, strMealThumb, strCategory
        } = meal;
        console.log(strMeal);
        const $modalTitle = $('#modal .modal-title');
        const $modalBody = $('#modal .modal-body');
        $modalTitle.textContent = strMeal;
        $modalBody.innerHTML = `
            <img class="img-fluid" alt=${strMeal} src=${strMealThumb}>
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades</h3>
        `;
        
        // IMPORTANT!!!
        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group');
        for(let i = 1; i < 20; i++) {
            if(meal[`strIngredient${i}`]) {
                const ingredients = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                const ingredientLi = document.createElement('li');
                ingredientLi.classList.add('list-group-item');
                ingredientLi.textContent = `${ingredients} - ${measure}`;

                listGroup.appendChild(ingredientLi);
            /* Seguir practicando codigo cuando venga el internet desde aqui */
            }
        }
        $modalBody.appendChild(listGroup);

        const $modalFooter = $('.modal-footer');
        $modalFooter.innerHTML = '';

        const favoriteBtn = document.createElement('button');
        favoriteBtn.classList.add('btn', 'btn-danger', 'col');
        favoriteBtn.textContent = mealExists(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        favoriteBtn.onclick = function() {
            if(mealExists(idMeal)) {
                deleteFavorite(idMeal);
                favoriteBtn.textContent = 'Guardar Favorito';
                showToast('Eliminado de Favoritos');
                return;
            }
            saveMealStorage({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
            favoriteBtn.textContent = 'Eliminar Favorito';
            showToast('Agregado a Favoritos');
        }

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('btn', 'btn-secondary', 'col');
        closeBtn.textContent = 'Cerrar';
        closeBtn.onclick = ()=> modal.hide();

        $modalFooter.appendChild(favoriteBtn);
        $modalFooter.appendChild(closeBtn);
        modal.show();
    }

    function saveMealStorage(obj) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? []; // ??: Devuelve la expresión del lado derecho del operador cuando la expresión del lado izquierdo es null o undefined
        localStorage.setItem('favorites', JSON.stringify([...favorites, obj]));
        console.log(favorites);
    }
    function deleteFavorite(id) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        favorites = favorites.filter(favorite => favorite.id !== id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function mealExists(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function showToast(send) {
        const $toast = $('#toast');
        const $toastBody = $('.toast-body');
        const toast = new bootstrap.Toast($toast);
        $toastBody.textContent = send;

        toast.show();
    }
    function getFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];

        if(!favorites.length) {
            const notFavorites = document.createElement('p');
            notFavorites.textContent = 'Aún no hay Favoritos';
            notFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
            $result.appendChild(notFavorites);
            return;
        }

        displayMeals(favorites);
    }
}

document.addEventListener('DOMContentLoaded', startApp);