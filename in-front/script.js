document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        } else {
            document.body.classList.remove('dark-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }

    const currentTheme = localStorage.getItem('theme');
    applyTheme(currentTheme || 'light');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                applyTheme('light');
                localStorage.setItem('theme', 'light');
            } else {
                applyTheme('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        const loginMessage = document.getElementById('loginMessage');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            if (password === '12345') {
                loginMessage.textContent = 'Login bem-sucedido! Redirecionando...';
                loginMessage.className = 'login-message success';
                localStorage.setItem('isLoggedIn', 'true');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                loginMessage.textContent = 'E-mail ou senha incorretos.';
                loginMessage.className = 'login-message error';
            }
        });
    }

    const mainContent = document.querySelector('.main-container');
    if (mainContent) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }

        const searchInput = document.getElementById('searchInput');
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');
        let currentItemId = null;
        let stockItems = [];

        async function fetchStockItems() {
            const response = await fetch('/api/stock');
            const data = await response.json();
            stockItems = data;
            renderStockItems();
        }

        function renderStockItems() {
            const stockListContainer = document.getElementById('stockListContainer');
            if (!stockListContainer) return;

            stockListContainer.innerHTML = '';
            stockItems.forEach(item => {
                const stockItemElement = document.createElement('div');
                stockItemElement.classList.add('stock-item');
                stockItemElement.dataset.id = item._id;

                let alert = '';
                if (item.quantity <= item.minQuantity) {
                    alert = `<span class="low-stock-alert">Nível baixo!</span>`;
                }

                stockItemElement.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}" class="stock-image">
                    <div class="stock-details">
                        <h4>${item.name}</h4>
                        <p>Quantidade: <span class="stock-level">${item.quantity}</span></p>
                        <p class="stock-min-level">Mínimo: ${item.minQuantity}</p>
                    </div>
                    ${alert}
                    <div class="stock-item-actions">
                        <button class="edit-button" data-id="${item._id}">Editar</button>
                        <button class="delete-button" data-id="${item._id}">Excluir</button>
                    </div>
                `;
                stockListContainer.appendChild(stockItemElement);
            });
        }

        const editNameInput = document.getElementById('editName');
        const editQuantityInput = document.getElementById('editQuantity');
        const editMinQuantityInput = document.getElementById('editMinQuantity');

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-button')) {
                const id = e.target.dataset.id;
                const item = stockItems.find(i => i._id === id);
                if (item) {
                    currentItemId = id;
                    editNameInput.value = item.name;
                    editQuantityInput.value = item.quantity;
                    editMinQuantityInput.value = item.minQuantity;
                    editModal.style.display = 'flex';
                }
            } else if (e.target.classList.contains('delete-button')) {
                const id = e.target.dataset.id;
                deleteItem(id);
            }
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedItem = {
                _id: currentItemId,
                name: editNameInput.value,
                quantity: parseInt(editQuantityInput.value),
                minQuantity: parseInt(editMinQuantityInput.value)
            };

            const response = await fetch('/api/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedItem)
            });

            if (response.ok) {
                editModal.style.display = 'none';
                fetchStockItems(); // Recarrega os dados do servidor
            } else {
                alert('Erro ao atualizar o item.');
            }
        });

        document.querySelector('.cancel-button').addEventListener('click', () => {
            editModal.style.display = 'none';
        });

        async function deleteItem(id) {
            if (confirm('Tem certeza que deseja excluir este item?')) {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: id })
                });

                if (response.ok) {
                    fetchStockItems(); // Recarrega os dados do servidor
                } else {
                    alert('Erro ao excluir o item.');
                }
            }
        }
        window.deleteItem = deleteItem;

        window.search = function() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredItems = stockItems.filter(item => item.name.toLowerCase().includes(searchTerm));
            
            const stockListContainer = document.getElementById('stockListContainer');
            stockListContainer.innerHTML = '';
            
            if (filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const stockItemElement = document.createElement('div');
                    stockItemElement.classList.add('stock-item');
                    stockItemElement.dataset.id = item._id;
                    let alert = '';
                    if (item.quantity <= item.minQuantity) {
                        alert = `<span class="low-stock-alert">Nível baixo!</span>`;
                    }
                    stockItemElement.innerHTML = `
                        <img src="${item.imageUrl}" alt="${item.name}" class="stock-image">
                        <div class="stock-details">
                            <h4>${item.name}</h4>
                            <p>Quantidade: <span class="stock-level">${item.quantity}</span></p>
                            <p class="stock-min-level">Mínimo: ${item.minQuantity}</p>
                        </div>
                        ${alert}
                        <div class="stock-item-actions">
                            <button class="edit-button" data-id="${item._id}">Editar</button>
                            <button class="delete-button" data-id="${item._id}">Excluir</button>
                        </div>
                    `;
                    stockListContainer.appendChild(stockItemElement);
                });
            } else {
                stockListContainer.innerHTML = '<p style="text-align:center;">Nenhum item encontrado.</p>';
            }
        };

        fetchStockItems();
    }
});